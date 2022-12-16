/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sell')
		.setDescription('Sell to the Shop')
		.addStringOption(option => option.setName('item').setDescription('What would you like to sell?'))
		.addIntegerOption(option => option.setName('amount').setDescription('How many?').setMinValue(1)),
	async execute(interaction, currency) {
		const itemName = interaction.options.getString('item');
		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });
		let amount = interaction.options.getInteger('amount');

		if (!item) return interaction.reply(`That item doesn't exist.`);
		if (!amount) amount = 1;
		
		const user = await Users.findOne({ where: { user_id: interaction.member.user.id } });
		const items = await user.getItems();

		console.log(`Item\n\n${JSON.stringify(item, null, 2)}`)
		console.log(`Items\n\n${JSON.stringify(items, null, 2)}`)

		const itemsHad = items.map(i => `${i.item.name}`);
		const numberHad = items.map(i => `${i.amount}`);

		console.log(itemsHad)
		console.log(numberHad)
		
		if (itemsHad.includes(`${item.name}`) && numberHad[itemsHad.indexOf(item.name)] >= amount){
            if (item.name == "Ember") {interaction.reply(`Iseden: How dare you try and sell my Ember!`); return { message: await interaction.fetchReply() };}
            else if (item.name == "Dragon's Fang") {interaction.reply(`Um, it's attached to you dumbass.`); return { message: await interaction.fetchReply() };}
			currency.add(interaction.member.user.id, amount*(item.cost*0.85).toFixed(2));
			for (k=1; k <= amount; k++){
				await user.removeItem(item);
			}
			await interaction.reply(`You've sold ${amount}: ${item.name} for ${amount*(item.cost*0.85).toFixed(2)} ⵇ.`)
		} else {
			await interaction.reply(`You don't have ${amount} ${item.name}.`)
		}

		return { message: `You've sold ${amount}: ${item.name} for ${amount*(item.cost*0.85).toFixed(2)} ⵇ.` }
		},
	async args(interaction) {
		return { none: "None",}
	},
};