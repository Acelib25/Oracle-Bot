/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('number')
		.setDescription('The Numbers The Numbers The Numbers'),
	async execute(interaction) {
		function getRandom(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
		const msg = await interaction.reply(`Check out <#970828540968849529> Number: ${getRandom(0,77)}`);
		return { message: await interaction.fetchReply() }
	},
	async args(interaction) {
		return { none: 'none' }
	},
};