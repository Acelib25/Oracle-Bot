/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bigthink')
		.setDescription('HMMMMMMMMMMMM'),
	async execute(interaction, currency) {
		
		function choose(choices) {
            var index = Math.floor(Math.random() * choices.length);
            return choices[index];
        }

		msgOptions = [
			"I have decided that your mother is a utter ||delight||.",
			"After some thought I have decided that you are lame.",
			"I have asked the Entropy to reveal your future, I regret to say you have none.",
			"The Entropy has told me you are pretty cool. :sunglasses:",
			"May your crops wither and your animals become diseased.",
			"My ponderings has concluded, you are a hoe.",
			"+10"
		]
		
		let decision = choose(msgOptions)

		if (decision == '+10'){
			decision = 'I see great fortune in your future! (+10 ⵇ)'
			currency.add(interaction.member.user.id, 10)
		}
		
		await interaction.deferReply();
		await wait(5000);
		await interaction.editReply(decision);
		return { message: await interaction.fetchReply() }
		//await interaction.reply('No More thinking, thoughts cause errors that crash me :P.\n\nIf you don\'t like it talk to Ace')
	},
	async args(interaction) {
		return { none: 'none' }
	},
};