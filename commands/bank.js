/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bank')
		.setDescription('Give or take money')
		.addIntegerOption(option => option.setName('amount').setDescription('How much?'))
        .addUserOption(option => option.setName('user').setDescription('Who? (Leave blank for yourself)')),
	async execute(interaction, currency) {
		const amount = interaction.options.getInteger('amount');
		const target = interaction.options.getUser('user') ?? interaction.member.user;
        if(interaction.member.user.id != '344143763918159884') {
            await interaction.reply(`Ace Only!`); 
            return { message: "none" }
        }
        
        currency.add(target.id, amount);
		await interaction.reply(`Added $${amount} to ${target.username}'s account.`);
		return { message: "none" }
		},
	async args(interaction) {
		return { none: "None",}
	},
};