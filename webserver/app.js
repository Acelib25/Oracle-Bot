const { Client, Collection, GatewayIntentBits, ActivityType, CommandInteractionOptionResolver } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const Sequelize = require('sequelize');
const { Users, CurrencyShop, Storage } = require('../dbObjects.js');
const { token } = require('../.config.json');
const express = require('express');
const app = express();
const port = 3000;
let testChannel;


/*
let tmp = Storage.create({
    guild_id: interaction.guild.id,
    value1key: 'HandsOff',
    value1: "false"
});

handsOffentry = await Storage.findOne({ where: { guild_id: interaction.guild.id, value1key: "HandsOff"}});
handsOff = handsOffentry.value1;

handsOffentry.save()
*/

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const client = new Client(
    {
        intents: [ GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.Guilds],
		loadMessageCommandListeners: true,
    },
);

const currency = new Collection();

Reflect.defineProperty(currency, 'add', {
	value: async (id, amount) => {
		const user = currency.get(id);

		if (user) {
			user.balance = user.balance + Number(amount);
			return user.save();
		}

		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);

		return newUser;
	},
});

Reflect.defineProperty(currency, 'getBalance', {
	value: id => {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});

app.get('/', express.static(path.join(__dirname, 'public')));

app.get('/send', (req, res) => {
    let arrs = req.query.message.split(",");
    for (let i = 0; i < arrs.length; i++) {
        testChannel.send(arrs[i]);
    }
    if (arrs.length > 1) {
        res.send("Messages Sent");
    } else {
        res.send("Message Sent");
    }
    console.log(req.query);
});

app.get('/:command', async (req, res) => {
    const commandObj = client.commands.get(req.params.command);
    const guildObj = client.guilds.cache.get(req.query.guild);
    const channelObj = guildObj.channels.cache.get(req.query.channel);
    
    try{
        await commandObj.url(guildObj, channelObj, currency);
        res.send("Success!")
    } catch(err) {
        console.log(err);
        res.send("Error");
    }
});
app.get('/:command/:subcommand', async (req, res) => {

    console.log(req.query);
    const commandObj = client.commands.get(req.params.command);
    const guildObj = client.guilds.cache.get(req.query.guild);
    const channelObj = guildObj.channels.cache.get(req.query.channel);
    
    try{
        await commandObj.url(req.query.subcommand, guildObj, channelObj, currency, req.query);
        res.send("Success!")
    } catch(err) {
        console.log(err);
        res.send("Error");
    }
});

client.once('ready', async () => {
	console.log('Webserver Connector Ready!');
    testChannel = client.guilds.cache.get('1049700882335400047').channels.cache.get('1082842699272552509');
    
    const storedBalances = await Users.findAll();
	storedBalances.forEach(b => currency.set(b.user_id, b));

    client.commands = new Collection();
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection
        // With the key as the command name and the value as the exported module
        client.commands.set(command.data.name, command);
        try{
            client.commands.set(command.ctx.name, command);
        } 
        catch(err){
        }
    }
    app.listen(port, () => console.log(`Web app started: app listening on port ${port}!`));
});

client.login(token);

