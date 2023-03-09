/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('give')
		.setDescription('Give an item')
		.addStringOption(option => option.setName('item').setDescription('What would you like to buy?'))
        .addIntegerOption(option => option.setName('amount').setDescription('How many?'))
		.addUserOption(option => option.setName('user').setDescription('Who? (Leave blank for yourself)')),
	async execute(interaction, currency) {
		const itemName = interaction.options.getString('item');
		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });
		const items = await CurrencyShop.findAll();
		const target = interaction.options.getUser('user') ?? interaction.member.user;
        let amount = interaction.options.getInteger('amount');

		if(interaction.member.user.id != '1054787604622606406' && interaction.member.user.id != '344143763918159884') {
            await interaction.reply(`Ace Only!`); 
            return { message: "none" }
        }

		if (!item) {interaction.reply(`That item doesn't exist.`); return { message: await interaction.fetchReply() };}
        
		
		if (amount < 0) {
			const user = await Users.findOne({ where: { user_id: target.id } });
			for (k=1; k <= -amount; k++){
				await user.removeItem(item);
			}
		}
		else {
			const user = await Users.findOne({ where: { user_id: target.id } });
			for (k=1; k <= amount; k++){
				await user.addItem(item);
			}
		}
		
		

		await interaction.reply(`You gave: ${amount} ${item.name} to ${target.username}.`);
		return { message: await interaction.fetchReply() }
		},
	async url(guild, channel, currency, args) {
		const itemName = args.item;
		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });
		const target = guild.members.cache.get(args.target).user;
		let amount = args.amount;
		
		if (amount < 0) {
			const user = await Users.findOne({ where: { user_id: target.id } });
			for (k=1; k <= -amount; k++){
				await user.removeItem(item);
			}
		}
		else {
			const user = await Users.findOne({ where: { user_id: target.id } });
			for (k=1; k <= amount; k++){
				await user.addItem(item);
			}
		}
		
		

		await channel.send(`You gave: ${amount} ${item.name} to ${target.username}.`);
		},
	async args(interaction) {
		return { none: "None",}
	},
};