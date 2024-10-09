const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear } = goals;
const http = require('http');

// Bot connection arguments
const botArgs = {
    host: 'kukonMjAU.aternos.me',  // Your server IP or hostname
    port: '',      // Minecraft server port
    username: "AFKbot",  // Bot's username
    version: '1.20.1'   // Minecraft version
};

let bot;
let retryCount = 0;
const maxRetries = 500000; // Maximum number of retries in case of disconnections

// Initialize and reconnect the bot
const initBot = () => {
    bot = mineflayer.createBot(botArgs);

    bot.loadPlugin(pathfinder);

    // When the bot logs in
    bot.on('login', () => {
        console.log(`Logged in to server`);
        retryCount = 0; // Reset retry count on successful login
    });

    // When the bot spawns into the world
    bot.on('spawn', () => {
        console.log("Bot spawned in the game!");

        // Make the bot move around randomly
        moveBotRandomly();
    });

    // Reconnection logic if the bot is disconnected
    bot.on('end', () => {
        console.log('Disconnected from server, attempting to reconnect...');
        
        // Reconnect after 10 seconds
        if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(() => {
                initBot();
            }, 10000);
        } else {
            console.log("Max retries reached, stopping reconnection attempts.");
        }
    });

    // Error handling
    bot.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
            console.log(`Failed to connect to ${err.address}:${err.port}`);
        } else if (err.code === 'ECONNRESET') {
            console.log('Connection was reset by the server. Retrying...');
            if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                    initBot();
                }, 10000);
            } else {
                console.log("Max retries reached, stopping reconnection attempts.");
            }
        } else {
            console.log(`Unhandled error: ${err}`);
        }

        // Retry connecting after 10 seconds
        if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(() => {
                initBot();
            }, 10000);
        }
    });
};

// Function to move the bot randomly
function moveBotRandomly() {
    // Move or jump at random intervals
    setInterval(() => {
        if (Math.random() > 0.5) {
            bot.setControlState('jump', true);
            setTimeout(() => {
                bot.setControlState('jump', false);
            }, 1000);  // Jump for 1 second
        }

        // Move forward randomly for 2 seconds
        bot.setControlState('forward', true);
        setTimeout(() => {
            bot.setControlState('forward', false);
        }, 2000);
    }, Math.random() * 5000 + 3000); // Random movement every 3-8 seconds
}

// Function to move the bot to specific coordinates (x, y, z)
function moveToCoordinates(x, y, z) {
    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    const goal = new GoalNear(x, y, z, 1);  // Goal coordinates and tolerance of 1 block
    bot.pathfinder.setGoal(goal);
}
// Tworzenie serwera HTTP na porcie 8080
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Minecraft działa!\n');
});

server.listen(8080, () => {
  console.log('Serwer HTTP działa na porcie 8080');
});

// Start the bot for the first time
initBot();
