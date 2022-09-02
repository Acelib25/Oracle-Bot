/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buy')
		.setDescription('Buy from the Shop')
		.addStringOption(option => option.setName('item').setDescription('What would you like to buy?').addChoices(
			{ name: 'Tea', value: 'Tea' },
			{ name: 'Coffee', value: 'Coffee' },
			{ name: 'Cake', value: 'Cake' },
			{ name: 'Entropy', value: 'Entropy' },
			{ name: 'null', value: 'null' },
		)),
	async execute(interaction, currency) {
		const itemName = interaction.options.getString('item');
		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });

		if (!item) return interaction.reply(`That item doesn't exist.`);
		
		if (item.cost > currency.getBalance(interaction.member.user.id).toFixed(2)) {
			return interaction.reply(`You currently have ${currency.getBalance(interaction.member.user.id).toFixed(2)} ⵇ, but the ${item.name} costs ${item.cost} ⵇ!`);
		}
		const user = await Users.findOne({ where: { user_id: interaction.member.user.id } });
		currency.add(interaction.member.user.id, item.cost * -1);
		await user.addItem(item);

		await interaction.reply(`You've bought: ${item.name}.`);
		return { message: await interaction.fetchReply() }
		},
	async args(interaction) {
		return { none: "None",}
	},
};