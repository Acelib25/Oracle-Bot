/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('top')
		.setDescription('The richest fuckers'),
        //.addStringOption(option => option.setName('item').setDescription('What would you like to buy?')),
	async execute(interaction, currency) {
		interaction.reply(
            currency.sort((a, b) => b.balance - a.balance)
                .filter(user => interaction.guild.members.cache.has(user.user_id))
                .first(30)
                .map((user, position) => `(${position + 1}) ${(interaction.guild.members.cache.get(user.user_id).user.username)}: ${user.balance.toFixed(2)} ⵇ`)
                .join('\n'),
            { code: true }
        );

		return { message: `Richies`, args: {none: "none"} }
		},
	async args(interaction) {
		return { none: "None",}
	},
};