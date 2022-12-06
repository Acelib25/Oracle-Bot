/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Oracle Says')
		.addStringOption(option => option.setName('message').setDescription('You what me to say what?'))
		.addAttachmentOption(option => option.setName('image').setDescription('You what me to show what?')),
	async execute(interaction, currency) {
		/*if(interaction.member.id != 344143763918159884){
			await interaction.reply({content: "Fuck you, no I am not saying that.", ephemeral: true});
		}*/
		
		const message = interaction.options.getString('message');
		const img = interaction.options.getAttachment('image');

		await interaction.reply({content: "Ok, I'll say that", ephemeral: true });
		if(img){
			await interaction.channel.send({ content: message, files: [img]})
		} else {
			await interaction.channel.send({ content: message})
		}
		return { message: await interaction.fetchReply() }
	},
	async args(interaction) {
		message = interaction.options.getString('message')
		const img = interaction.options.getAttachment('image');
		return { message: message, file: img }
	},
};