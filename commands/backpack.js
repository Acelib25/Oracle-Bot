/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('backpack')
		.setDescription('Check your backpack.')
		.addSubcommand(sub => 
			sub
			.setName("items")
			.setDescription("check for items")
			.addUserOption(option => option.setName('user').setDescription('Who? (Leave blank for yourself)'))
			)
		.addSubcommand(sub => 
			sub
			.setName("money")
			.setDescription("check for money")
			.addUserOption(option => option.setName('user').setDescription('Who? (Leave blank for yourself)'))
			)
		,
	async execute(interaction, currency) {
		if (interaction.options.getSubcommand() === 'items') {
			await interaction.reply("Loading")
			const target = interaction.options.getUser('user') ?? interaction.member.user;
			const user = await Users.findOne({ where: { user_id: target.id } });
			const items = await user.getItems();

			if (!items.length) return interaction.editReply(`${target.tag} has nothing!`);

			await interaction.editReply(`${target.tag} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
			return { message: await interaction.fetchReply(), args: {none:"none"} }
		}

		else if (interaction.options.getSubcommand() === 'money'){
			
			const taggedUser = interaction.options.getUser('user');
			await interaction.reply("Loading")
			let out;
			if(!taggedUser){
				out = (`You have ${currency.getBalance(interaction.member.user.id).toFixed(2)} ⵇ`)

			} else {
				out = (`${taggedUser} has ${currency.getBalance(taggedUser.id).toFixed(2)} ⵇ`)

			}
			
			
			//await interaction.deferReply();
			//await wait(1000);
			await interaction.editReply(out);
			return { message: await interaction.fetchReply(), args: {none:"none"} }
		}
	},
	async args(interaction) {
		return { none: "None",}
	},
};