/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bigthink')
		.setDescription('HMMMMMMMMMMMM'),
	async execute(interaction) {
		await interaction.deferReply();
		await wait(600000);
		await interaction.editReply('I have decided that your mother is a ||nice lady||');
	},
};