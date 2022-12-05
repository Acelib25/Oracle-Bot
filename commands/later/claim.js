/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inv')
		.setDescription('Check your backpack.')
		.addUserOption(option => option.setName('user').setDescription('Who? (Leave blank for yourself)')),
	async execute(interaction, currency) {
		
		const target = interaction.options.getUser('user') ?? interaction.member.user;
		const user = await Users.findOne({ where: { user_id: target.id } });
		const items = await user.getItems();

		if (!items.length) return interaction.reply(`${target.tag} has nothing!`);

		await interaction.reply(`${target.tag} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
		return { message: await interaction.fetchReply() }
	},
	async args(interaction) {
		return { none: "None",}
	},
};