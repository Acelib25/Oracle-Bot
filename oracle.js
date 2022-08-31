/* eslint-disable no-unused-vars */
// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token } = require('./.config.json');

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
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	client.user.setStatus('online');
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) return;

	//Set name
	let speakers_name = interaction.member.nick;
	if (speakers_name == null) {
		speakers_name = interaction.member.user.username;
	}

	try {
		await command.execute(interaction);
		client.user.setActivity(speakers_name, { type: ActivityType.Listening });
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

	let args = "None";


	const feedbackEmbed =  {
		color: 0x56ceb3,
		title: `${interaction.member.user.tag} ran a command`,
		fields: [
			{ name: 'Command', value: `${interaction.commandName}` },
			{ name: 'Args', value: `${args}`},
			{ name: 'Guild', value:  `${interaction.guild.name}(${interaction.guild.id})`}
		],
		timestamp: new Date().toISOString(),
	}
	client.guilds.cache.get('747587696867672126').channels.cache.get('747587927261052969').send({ embeds: [feedbackEmbed]})
});



// Login to Discord with your client's token
client.login(token);