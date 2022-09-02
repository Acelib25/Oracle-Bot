/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bal')
		.setDescription('Check someones Entropy Level')
		.addUserOption(option => option.setName('target').setDescription('Who? (Leave blank for yourself)')),
	async execute(interaction, currency) {
		const taggedUser = interaction.options.getUser('target');

		let out;
        if(!taggedUser){
            out = (`You have ${currency.getBalance(interaction.member.user.id).toFixed(2)} ⵇ`)

        } else {
            out = (`${taggedUser} has ${currency.getBalance(taggedUser.id).toFixed(2)} ⵇ`)
  
        }
		
		
		await interaction.deferReply();
		await wait(1000);
		await interaction.editReply(out);
		return { message: await interaction.fetchReply() }
	},
	async args(interaction) {
		const taggedUser = interaction.options.getUser('target');
		return { target: taggedUser,}
	},
};