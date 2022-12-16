/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Check The Shop'),
	async execute(interaction, currency) {
		
		const items = await CurrencyShop.findAll();
		await interaction.reply(codeBlock(items.sort((a, b) => a.cost - b.cost).map(i => `${i.name}: ${i.cost} ⵇ`).join('\n')));
		return { message: await interaction.fetchReply() }
	},
	async args(interaction) {
		return { none: "None",}
	},
};