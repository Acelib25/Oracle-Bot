/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const msg = await interaction.reply('Ping?');
        msg.edit(`Pong from JavaScript! API Latency ${msg.createdTimestamp - message.createdTimestamp}ms.`)
	},
};