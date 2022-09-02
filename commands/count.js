/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('count')
		.setDescription('Counts to number!')
		.addIntegerOption(option => option.setName('target').setDescription('How high?')),
	async execute(interaction, currency) {
		
		const num = interaction.options.getInteger('target')

		if (num > 100){
			num = 100;
		}

		await interaction.reply(`Ok I will count to ${num}`)
		await wait(2000);
		for (let i = 1; i <= num; i++){
			interaction.editReply(`${i}`)
			await wait(1000);
		}
		interaction.editReply(`Done! ${num}`)
		return { message: await interaction.fetchReply() }
	},
	async args(interaction) {
		const num = interaction.options.getInteger('target')
		return { target_number: num }
	},
};