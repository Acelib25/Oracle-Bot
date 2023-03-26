const express = require('express');
const { Client, Collection, GatewayIntentBits, ActivityType, CommandInteractionOptionResolver } = require('discord.js');
const colors = require('colors');
const path = require('node:path');

const config = require('./config.json');
const { connectDB } = require('./controllers/db.js');
const { request } = require('undici');

const app = express();
const authListener = express();
const userInfoRouter = require('./routes/users.js');
const itemManagementRouter = require('./routes/items.js');
const workerManagementRouter = require('./routes/workers.js');
const webRoutes = require('./routes/web.js');

const client = new Client(
    {
        intents: [ GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.Guilds],
		loadMessageCommandListeners: true,
    },
);

client.on('ready', async () => {
    //console.log('before mongo connect');
    await connectDB();
    //console.log('after mongo connect');
    console.log('[BTSRV] Discord bot ready!'.magenta);
    app.use('/users', userInfoRouter);
    app.use('/items', itemManagementRouter);
    app.use('/workers', workerManagementRouter);
    app.use('/', webRoutes);
    /*app.get('/auth', (req, res, next) => {
        console.log('[AUTH] Auth page requested'.yellow);
        //res.redirect(301, "")
    });*/

    app.listen(config.port, () => {
        console.log(`[WBSRV] ${config.gameTitle} listening on port ${config.port}!`.magenta);
    });
});

client.login(config.discord.token);