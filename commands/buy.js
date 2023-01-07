/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buy')
		.setDescription('Buy from the Shop')
		.addStringOption(option => option.setName('item').setDescription('What would you like to buy?'))
        .addIntegerOption(option => option.setName('amount').setDescription('How many?').setMinValue(1)),
	async execute(interaction, currency) {
		const itemName = interaction.options.getString('item');
		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });
		const items = await CurrencyShop.findAll();
        let amount = interaction.options.getInteger('amount');

		if (!item) {interaction.reply(`That item doesn't exist.`); return { message: await interaction.fetchReply() };}
        
		if (item.name == "Ember") {interaction.reply(`Iseden: An Ember is not something that can be bought, it is earned.`); return { message: await interaction.fetchReply() };}
        else if (item.name == "Dragon's Fang") {interaction.reply(`Unless you want to brave reaching your hand in Sovaeris's mouth you can't buy this.`); return { message: await interaction.fetchReply() };}
        else if (item.name == "Bag of Volts") {interaction.reply(`You can't seem to find the Bag of Volts that Fate sent you to get. Shocking.`); return { message: await interaction.fetchReply() };}
		else if (item.name == "The Fisherman's Wife") {interaction.reply(`You can't buy her, you have to earn her.`); return { message: await interaction.fetchReply() };}
		else if (item.name == "Gas Lantern") {
			interaction.reply(`That item does not exist, here is a list of items we have.\n`);
			await wait(1000);
			interation.followUp(codeBlock(items.sort((a, b) => a.cost - b.cost).map(i => {if(i.name == 'Gas Lantern'){return} return `${i.name}: ${i.cost} ⵇ`}).join('\n'))); 
			return { message: await interaction.fetchReply()};
		}
		else if (item.name == "Fate's Brain") {interaction.reply(`You gotta fight Ace for it.`); return { message: await interaction.fetchReply() };}
		
			
		
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