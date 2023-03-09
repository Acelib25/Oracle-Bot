const { Client, Collection, GatewayIntentBits, ActivityType, CommandInteractionOptionResolver } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { Users, CurrencyShop, Storage } = require('../dbObjects.js');
const { token } = require('../.config.json');
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
let currency;
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

const client = new Client(
    {
        intents: [ GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.Guilds],
		loadMessageCommandListeners: true,
    },
);

currency = new Collection();

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

client.once('ready', async () => {
	console.log('Webserver Connector Ready!');
    
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

    client.user.setActivity({ type: ActivityType.Watching, name: 'Anden fuck up the webserver' });
    console.log(`Logged in as ${client.user.tag}!`);

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.get('/', express.static(path.join(__dirname + '/public')));
    app.post('/send', (req, res) => {
        console.log(req.body);
        console.log("Got message as: " + typeof req.body.message);
        if (req.body.channel_id) {
            testChannel = client.guilds.cache.get('1049700882335400047').channels.cache.get(req.body.channel_id);
        } else {
            testChannel = client.guilds.cache.get('1049700882335400047').channels.cache.get('1082842699272552509');
        }
        if (typeof req.body.message === 'object') {
            for (let i = 0; i < req.body.message.length; i++) {
                if (req.body.message[i].includes(",,")){
                    console.log("Splitting and sending message (", i, ")");
                    let arrs = req.body.message[i].split(",,");
                    for (let j = 0; j < arrs.length; j++) {
                        testChannel.send(arrs[j]);
                    }
                    res.redirect('/');
                } else {
                    console.log("Sending message (", i, ")");
                    testChannel.send(req.body.message[i]);
                    res.redirect('/');
                }
            }
        } else {
            if (req.body.message.includes(",,")){
                console.log("Splitting and sending message");
                let arrs = req.body.message.split(",,");
                for (let j = 0; j < arrs.length; j++) {
                    testChannel.send(arrs[j]);
                }
                res.redirect('/');
            } else {
                console.log("Sending message");
                testChannel.send(req.body.message);
                res.redirect('/');
            }
        }
    });
    app.get('/interact/:command', async (req, res, next) => {
        console.log(req.body);
        console.log("Page requested: /" + req.params.command);
        if (req.query.subcommand) {
            console.log("Attempting to execute command: '" + req.params.command + "', subcommand: '" + req.query.subcommand + "'");
        } else {
            console.log("Attempting to execute command: '" + req.params.command + "'");
        }
    
        const commandObj = client.commands.get(req.params.command);
        const guildObj = client.guilds.cache.get(req.query.guild);
        const channelObj = guildObj.channels.cache.get(req.query.channel);
        
        try{
            if (req.query.subcommand) {
                await commandObj.url(req.query.subcommand, guildObj, channelObj, currency, req.query);
            } else {
                await commandObj.url(guildObj, channelObj, currency, req.query);
            }
            res.send("Success!");
        } catch(err) {
            console.log(err);
            res.send("Error!\n", err);
        }
    });


    // See args.txt for what wants what.
    app.post('/interact/:command', async (req, res, next) => {
        console.log(req.body);
        
        let testChannel = client.guilds.cache.get('1049700882335400047').channels.cache.get('1082842699272552509');

        if (req.body.subcommand) {
            console.log("Attempting to execute command: '" + req.params.command + "', subcommand: '" + req.body.subcommand + "'");
        } else {
            console.log("Attempting to execute command: '" + req.params.command + "'");
        }  
        if (req.body.channel_id) {
            testChannel = client.guilds.cache.get('1049700882335400047').channels.cache.get(req.body.channel_id);
        } else {
            testChannel = client.guilds.cache.get('1049700882335400047').channels.cache.get('1082842699272552509');
        }
        const commandObj = client.commands.get(req.params.command);
        const guildObj = client.guilds.cache.get('1049700882335400047');
        const channelObj = testChannel;

        try{
            if (req.body.subcommand) {
                await commandObj.url(req.body.subcommand, guildObj, channelObj, currency, req.body);
                res.redirect('/');
            } else {
                await commandObj.url(guildObj, channelObj, currency, req.body);
                res.redirect('/');
            }
            
        } catch(err) {
            console.log(err);
            res.redirect('/');
        }
    });

    app.listen(port, () => console.log(`Web app started: app listening on port ${port}!`));
});

client.login(token);