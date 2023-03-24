const express = require('express');
const { Client, Collection, GatewayIntentBits, ActivityType, CommandInteractionOptionResolver } = require('discord.js');
const colors = require('colors');
const path = require('node:path');

const config = require('./config.json');
const { connectDB } = require('./connectors/db.js');

const app = express();
const userInfoRouter = require('./routes/userInfo.js');
const itemManagementRouter = require('./routes/items.js');

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
    console.log('[BOT] Ready!'.magenta);
    app.use('/infoGrab', userInfoRouter);
    app.use('/item', itemManagementRouter);
    app.use('/', express.static(path.join(__dirname + '/public')));
    app.listen(3000, () => {
        console.log('[WEBSERVER] Example app listening on port 3000!'.magenta);
    });
});

client.login(config.discord.token);