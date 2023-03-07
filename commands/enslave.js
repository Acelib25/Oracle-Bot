/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop, Workers, WorkerShop,  } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('enslave')
		.setDescription('Give a worker')
		.addStringOption(option => option.setName('item').setDescription('Who?'))
        .addIntegerOption(option => option.setName('amount').setDescription('How many?'))
		.addUserOption(option => option.setName('user').setDescription('Who? (Leave blank for yourself)')),
	async execute(interaction, currency) {
		const workerName = interaction.options.getString('item');
		const worker = await WorkerShop.findOne({ where: { name: { [Op.like]: workerName } } });
		const workers = await WorkerShop.findAll();
		const target = interaction.options.getUser('user') ?? interaction.member.user;
        let amount = interaction.options.getInteger('amount');

		if(interaction.member.user.id != '1054787604622606406' && interaction.member.user.id != '344143763918159884') {
            await interaction.reply(`Ace Only!`); 
            return { message: "none" }
        }

		if (!worker) {interaction.reply(`That item doesn't exist.`); return { message: await interaction.fetchReply() };}
        
		
		if (amount < 0) {
			const user = await Users.findOne({ where: { user_id: target.id } });
			for (k=1; k <= -amount; k++){
				try {
					await user.undeployWorker(worker);
				} catch(e) {
					console.log("None deployed.")
				}
				await user.removeWorker(worker);
			}
		} 
		else {
			const user = await Users.findOne({ where: { user_id: target.id } });
			for (k=1; k <= amount; k++){
				await user.addWorker(worker);
			}
		}
		
		

		await interaction.reply(`You gave: ${amount} ${worker.name} to ${target.username}.`);
		return { message: await interaction.fetchReply() }
		},
	async args(interaction) {
		return { none: "None",}
	},
};