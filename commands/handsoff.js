/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop, Storage } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('handsoff')
		.setDescription('Engage Hands Off')
		.addStringOption(option => option.setName('val').setDescription('True/False').setChoices(
			{name: "True", value: "true"},
			{name: "False", value: "false"}
		).setRequired(true)),
	async execute(interaction, currency) {
		const val = interaction.options.getString('val');
		
		if(interaction.member.user.id != '1054787604622606406' && interaction.member.user.id != '344143763918159884') {
            await interaction.reply(`Ace Only!`); 
            return { message: "none" }
        }
		
		let handsOffentry = await Storage.findOne({ where: { guild_id: interaction.guild.id, value1key: "HandsOff"}});
        if (handsOffentry == null){
            let tmp = Storage.create({
                guild_id: interaction.guild.id,
                value1key: 'HandsOff',
                value1: val
            });
            handsOffentry = await Storage.findOne({ where: { guild_id: interaction.guild.id, value1key: "SlotsPot"}});
            
        }

		handsOffentry.update({ value1: val });

		await interaction.reply(`Hands Off set to ${val}`);
		return { message: await interaction.fetchReply() }
		},
	async args(interaction) {
		return { none: "None",}
	},
};