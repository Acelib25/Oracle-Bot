/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buy')
		.setDescription('Buy from the Shop')
		.addStringOption(option => option.setName('item').setDescription('What would you like to buy?')
        .addIntegerOption(option => option.setName('amount').setDescription('How many?').setMinValue(1)),
		),
	async execute(interaction, currency) {
		const itemName = interaction.options.getString('item');
		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });
        let amount = interaction.options.getInteger('amount');

		if (!item) return interaction.reply(`That item doesn't exist.`);
        if (!amount) amount = 1;
		
		if (item.cost * amount > currency.getBalance(interaction.member.user.id).toFixed(2)) {
			return interaction.reply(`You currently have ${currency.getBalance(interaction.member.user.id).toFixed(2)} ⵇ, but the ${item.name} costs ${item.cost} x ${amount} (${item.cost * amount}) ⵇ!`);
		}
		const user = await Users.findOne({ where: { user_id: interaction.member.user.id } });
		currency.add(interaction.member.user.id, item.cost * -amount);
        for (k=1; k <= amount; k++){
            await user.addItem(item);
        }

		await interaction.reply(`You've bought: ${amount} ${item.name}.`);
		return { message: await interaction.fetchReply() }
		},
	async args(interaction) {
		return { none: "None",}
	},
};