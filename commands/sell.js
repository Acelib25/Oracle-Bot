/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sell')
		.setDescription('Sell to the Shop')
		.addStringOption(option => option.setName('item').setDescription('What would you like to sell?')),
	async execute(interaction, currency) {
		const itemName = interaction.options.getString('item');
		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });

		if (!item) return interaction.reply(`That item doesn't exist.`);
		
		const user = await Users.findOne({ where: { user_id: interaction.member.user.id } });
		const items = await user.getItems();

		console.log(`Item\n\n${JSON.stringify(item, null, 2)}`)
		console.log(`Items\n\n${JSON.stringify(items, null, 2)}`)

		const itemsHad = items.map(i => `${i.item.name}`);
		const numberHad = items.map(i => `${i.amount}`);

		console.log(itemsHad)
		console.log(numberHad)
		
		if (itemsHad.includes(`${item.name}`) && numberHad[itemsHad.indexOf(item.name)] > 0){
			currency.add(interaction.member.user.id, (item.cost*0.70).toFixed(2));
			await user.removeItem(item);
			await interaction.reply(`You've sold: ${item.name} for ${(item.cost*0.70).toFixed(2)} ⵇ.`)
		} else {
			await interaction.reply(`You don't have ${item.name}.`)
		}

		return { message: `You've sold: ${item.name} for ${(item.cost*0.70).toFixed(2)} ⵇ.` }
		},
	async args(interaction) {
		return { none: "None",}
	},
};