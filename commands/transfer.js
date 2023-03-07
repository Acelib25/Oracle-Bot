/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transfer')
		.setDescription('Transfer stuff')
		.addStringOption(option => option.setName('option').setDescription('What would you like to transfer?').setChoices(
			{name: "Item", value: "Item"},
			{name: "Worker", value: "Worker"},
			{name: "Entropy", value: "Entropy"}
		).setRequired(true))
		.addStringOption(option => option.setName('obj').setDescription('Which worker or item? (Blank for Entropy)'))
        .addIntegerOption(option => option.setName('amount').setDescription('How many?'))
		.addUserOption(option => option.setName('user').setDescription('To Whom?')),
	async execute(interaction, currency) {
		const option = interaction.options.getString('option');
		const obj = interaction.options.getString('obj');
		const target = interaction.options.getUser('user') ?? interaction.member.user;
        let amount = interaction.options.getInteger('amount');

		const rec = await Users.findOne({ where: { user_id: target.id } });
		const sen = await Users.findOne({ where: { user_id: interaction.member.user.id } });


		if (option == 'Item'){
			const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: obj } } });
			const items = await sen.getItems();
			const itemsHad = items.map(i => `${i.item.name}`);
			const numberHad = items.map(i => `${i.amount}`);

			if (!item) {interaction.reply(`That item doesn't exist.`); return { message: await interaction.fetchReply() };}

			if (!(itemsHad.includes(`${item.name}`) && numberHad[itemsHad.indexOf(item.name)] >= amount)){
				await interaction.reply(`You don't have ${amount} ${item.name}.`)
				return { message: await interaction.fetchReply() }
			}

		
			if (amount <= 0) {
				amount = 1;
			}
			
			for (k=1; k <= amount; k++){
				await rec.addItem(item);
				await sen.removeItem(item);
			}

			await interaction.reply(`You gave: ${amount} ${item.name} to ${target.username}.`);
			return { message: await interaction.fetchReply() }
		}
		else if (option == 'Worker'){
			const worker = await WorkerShop.findOne({ where: { name: { [Op.like]: obj } } });
			const workers = await sen.getWorkers();
			const workersHad = workers.map(i => `${i.worker.name}`);
			const numberHad = workers.map(i => `${i.amount}`);

			if (!worker) {interaction.reply(`That worker doesn't exist.`); return { message: await interaction.fetchReply() };}
			
			if (!(workersHad.includes(`${worker.name}`) && numberHad[workersHad.indexOf(worker.name)] >= amount)){
				await interaction.reply(`You don't have ${amount} ${worker.name}.`)
				return { message: await interaction.fetchReply() }
			}

		
			if (amount <= 0) {
				amount = 1;
			}

			for (k=1; k <= amount; k++){
				await rec.addWorker(item);
				await sen.removeWorker(item);
			}

			await interaction.reply(`You gave: ${amount} ${worker.name} to ${target.username}.`);
			return { message: await interaction.fetchReply() }
		}
		else if (option == 'Entropy'){
			
			if (amount <= 0) {
				amount = 1;
			}

			if(parseInt(currency.getBalance(interaction.member.user.id)) <  amount){
				await interaction.editReply("You don't have that much to send!")
				return { message: await interaction.fetchReply() }
			}
			else {
				currency.add(interaction.member.user.id, -amount);
				currency.add(target.id, amount);
			}
			
			await interaction.reply(`You gave: ${amount} ⵇ to ${target.username}.`);
			return { message: await interaction.fetchReply() }
		}
		else {
			await interaction.reply(`Something's fucked up...`);
			return { message: await interaction.fetchReply() }
		}
		
		},
	async args(interaction) {
		return { none: "None",}
	},
};