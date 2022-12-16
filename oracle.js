/* eslint-disable no-unused-vars */
// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits, ActivityType, CommandInteractionOptionResolver } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token } = require('./.config.json');
const Sequelize = require('sequelize');
const { Users, CurrencyShop } = require('./dbObjects.js');


const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

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

// Create a new client instance
const client = new Client(
    {
        intents: [ GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.Guilds],
		loadMessageCommandListeners: true,
    },
);


client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
	try{
		client.commands.set(command.ctx.name, command);
	} catch(err){
	}
}

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	client.user.setStatus('online');
	const storedBalances = await Users.findAll();
	storedBalances.forEach(b => currency.set(b.user_id, b));
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!(interaction.isChatInputCommand() || interaction.isButton() || interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand())) return;

	
	if(interaction.isChatInputCommand()){
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) return;

		//Set name
		let speakers_name = interaction.member.nickname;
		if (speakers_name == null) {
			speakers_name = interaction.member.user.username;
		}

        const commandObj = await command.execute(interaction, currency);
		currency.add(interaction.member.user.id, 0.10)

		try {
			
			const cmdMessage = await commandObj.message;
			
			let args = await commandObj.args;

			console.log(args);
			console.log(JSON.stringify(args, null, 4));

			const feedbackEmbed =  {
				color: 0x2c806a,
				title: `${interaction.member.user.tag} ran a command`,
				fields: [
					{ name: 'Command', value: `${interaction.commandName}` },
					{ name: 'Args', value: `\`\`\`${JSON.stringify(args, null, 4)}\`\`\``},
					{ name: 'Content', value: `; ${cmdMessage}`},
					{ name: 'Guild', value:  `${interaction.guild.name}(${interaction.guild.id})`},
					{ name: 'Channel', value:  `${interaction.channel.name}(${interaction.channel.id})`},
				],
				timestamp: new Date().toISOString(),
			}
			client.guilds.cache.get('747587696867672126').channels.cache.get('747587927261052969').send({ embeds: [feedbackEmbed]})
			
			client.user.setActivity(speakers_name, { type: ActivityType.Listening });
		} catch (error) {
			console.error(error);
			try {await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true})} catch(e){console.log("Fucked up")}
		}
	}
	
	/*else if(interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()){
		const context = interaction;
		const cmd_name = context.commandName;
		const command = context.client.commands.get(cmd_name);
		//const ctx_command = context.client.commands.get(command.command);

		//Set name
		let speakers_name = interaction.member.nickname;
		if (speakers_name == null) {
			speakers_name = interaction.member.user.username;
		}

		try {
			const commandObj = await command.execute(context, currency, true, command.args);
			
			let args = await command.args(context, cmd_name);
			const feedbackEmbed =  {
				color: 0x2c806a,
				title: `${interaction.member.user.tag} pressed a button`,
				fields: [
					{ name: 'Command', value: `${cmd_name}` },
					{ name: 'Args', value: `\`\`\`${JSON.stringify(args, null, 4)}\`\`\``},
					{ name: 'Guild', value:  `${interaction.guild.name}(${interaction.guild.id})`},
					{ name: 'Channel', value:  `${interaction.channel.name}(${interaction.channel.id})`},
				],
				timestamp: new Date().toISOString(),
			}
			client.guilds.cache.get('747587696867672126').channels.cache.get('747587927261052969').send({ embeds: [feedbackEmbed]})
			
			client.user.setActivity(speakers_name, { type: ActivityType.Listening });
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}*/
		
	else if(interaction.isButton()){
		const button = interaction;
		console.log(button)
		let cmd_name = button.message.interaction.commandName;
		console.log(cmd_name);

		if (cmd_name == "fun bonk"){
			cmd_name = "fun"
		}

		const command = button.client.commands.get(cmd_name);

		//Set name
		let speakers_name = interaction.member.nickname;
		if (speakers_name == null) {
			speakers_name = interaction.member.user.username;
		}

		try {
			const commandObj = await command.press(button, currency);
			
			let args = await command.p_args(button, cmd_name);
			const feedbackEmbed =  {
				color: 0x2c806a,
				title: `${interaction.member.user.tag} pressed a button`,
				fields: [
					{ name: 'Command', value: `${cmd_name}` },
					{ name: 'Args', value: `\`\`\`${JSON.stringify(args, null, 4)}\`\`\``},
					{ name: 'Guild', value:  `${interaction.guild.name}(${interaction.guild.id})`},
					{ name: 'Channel', value:  `${interaction.channel.name}(${interaction.channel.id})`},
				],
				timestamp: new Date().toISOString(),
			}
			client.guilds.cache.get('747587696867672126').channels.cache.get('747587927261052969').send({ embeds: [feedbackEmbed]})
			
			client.user.setActivity(speakers_name, { type: ActivityType.Listening });
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
	
	
	
});



// Login to Discord with your client's token
client.login(token);