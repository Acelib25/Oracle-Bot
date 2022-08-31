/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Oracle Says')
		.addStringOption(option => option.setName('message').setDescription('You what me to say what?')),
	async execute(interaction) {
		if(interaction.member.id != 344143763918159884){
			await interaction.reply({content: "Fuck you, no I am not saying that.", ephemeral: true});
		}
		
		const message = interaction.options.getString('message');
		await interaction.reply({content: "Ok, I'll say that", ephemeral: true});
		await interaction.channel.send(message)
	},
};