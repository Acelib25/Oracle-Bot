/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bigthink')
		.setDescription('HMMMMMMMMMMMM'),
	async execute(interaction) {
		await interaction.deferReply();
		await wait(60000);
		await interaction.editReply('Pong!');
	},
};