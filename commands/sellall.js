/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop, Workers, WorkerShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sellall')
		.setDescription('Sell EVERYTHING to the Shop')
		.addStringOption(option => option.setName('confirm').setDescription('ARE YOU SURE YOU WANT TO SELL EVERYTHING? (Type something to confirm)').setRequired(true)),
	async execute(interaction, currency) {
		const user = await Users.findOne({ where: { user_id: interaction.member.user.id } });
		const items = await user.getItems();

		console.log(`Items\n\n${JSON.stringify(items, null, 2)}`)

		const itemsHad = items.map(i => `${i.item.name}`);
		const numberHad = items.map(i => `${i.amount}`);

		console.log(itemsHad)
		console.log(numberHad)

		await interaction.reply('Selling...');
		
		let sum = 0

		for(let k=0; k < itemsHad.length; k++){
			const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemsHad[k] } } });
			
			if (item.name == "Ember") {}
			else if (item.name == "Dragon's Fang") {}
			else if (item.name == "Bag of Volts"){} 
			else if (item.name == "The Fisherman's Wife") {}
			else if (item.name == "Gas Lantern") {}
			else if (item.name == "Egg Borgur" && interaction.member.user.id == 718599764173914193) {}
			else if (item.name == "Fate's Brain") {}
			else {
				for (let j=0; j < numberHad[k]; j++){
					await user.removeItem(item);
					await currency.add(interaction.member.user.id, (item.cost*0.85).toFixed(2));
					sum += (item.cost*0.85).toFixed(2)
			}
				await interaction.editReply(`Earnings!\n\n ${sum} ⵇ`)
			}			
		}
		console.log("Done!")
		await interaction.followUp("You sold everything!")
		return { message: `You've sold everything!` }
		},
	async args(interaction) {
		return { none: "None",}
	},
};