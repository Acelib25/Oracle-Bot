/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('8')
		.setDescription('See what fate says')
		.addStringOption(option => option.setName('question').setDescription('What shall ye ask?')),
	async execute(interaction, currency) {

		let question = interaction.options.getString('question');
		
		function choose(choices) {
            var index = Math.floor(Math.random() * choices.length);
            return choices[index];
        }

		msgOptions = [
			"It is certain.",
			"It is decidedly so.",
			"Without a doubt.",
			"Yes definitely.",
			"You may rely on it.",
			"As I see it, yes.",
			"Most likely.",
			"Outlook good.",
			"Yes.",
			"Signs point to yes.",
			"Reply hazy, try again.",
			"Ask again later.",
			"Better not tell you now.",
			"Cannot predict now.",
			"Concentrate and ask again.",
			"Don't count on it.",
			"My reply is no.",
			"My sources say no.",
			"Outlook not so good.",
			"Very doubtful.",
			"Pasta."
		]
		
		let decision = choose(msgOptions)

		let name = interaction.member.user.username;

		if (interaction.member.nickname){
			name = interaction.member.nickname;
		}
		
		if (!question){
			question = "*secret*"
		}

		await interaction.reply(`${name} asks: "${question}".\n8-Ball: *Thinking...*`);
		await wait(5000);
		await interaction.editReply(`${name} asks: "${question}".\n8-Ball: ${decision}`);
		return { message: await interaction.fetchReply() }
		//await interaction.reply('No More thinking, thoughts cause errors that crash me :P.\n\nIf you don\'t like it talk to Ace')
	},
	async args(interaction) {
		return { none: 'none' }
	},
};
