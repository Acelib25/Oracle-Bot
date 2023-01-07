/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop, Workers, WorkerShop } = require('../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sell')
		.setDescription('Sell to the Shop')
        .addIntegerOption(option => option.setName('amount').setDescription('How many?').setMinValue(1))
		.addStringOption(option => option.setName('item').setDescription('What would you like to sell?')),
	async execute(interaction, currency) {
		const itemName = interaction.options.getString('item');
		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });
		let amount = interaction.options.getInteger('amount');

		if (!item) return interaction.reply(`That item doesn't exist.`);
		if (!amount) amount = 1;
		
		const user = await Users.findOne({ where: { user_id: interaction.member.user.id } });
		const items = await user.getItems();

		console.log(`Item\n\n${JSON.stringify(item, null, 2)}`)
		console.log(`Items\n\n${JSON.stringify(items, null, 2)}`)

		const itemsHad = items.map(i => `${i.item.name}`);
		const numberHad = items.map(i => `${i.amount}`);

		console.log(itemsHad)
		console.log(numberHad)
		
		if (itemsHad.includes(`${item.name}`) && numberHad[itemsHad.indexOf(item.name)] >= amount){
            if (item.name == "Ember") {interaction.reply(`Iseden: How dare you try and sell my Ember!`); return { message: await interaction.fetchReply() };}
            else if (item.name == "Dragon's Fang") {interaction.reply(`Um, it's attached to you dumbass.`); return { message: await interaction.fetchReply() };}
			else if (item.name == "Bag of Volts") {interaction.reply(`If you can convince an apprentice to buy this we have a deal.`); return { message: await interaction.fetchReply() };}
			else if (item.name == "The Fisherman's Wife") {interaction.reply(`No, you're stuck with her now.`); return { message: await interaction.fetchReply() };}			
			else if (item.name == "Gas Lantern") {
				const target =  interaction.member.user
				const deployed = await Workers.findAll({ where: { user_id: target.id } });
				const user = await Users.findOne({ where: { user_id: target.id } });
				const items = await user.getItems();
				const workers = await user.getWorkers();
				const workerID = deployed.map(i => `${i.worker_id}`);
	
				let count = workerID.reduce((cnt, cur) => (cnt[cur] = cnt[cur] + 1 || 1, cnt), {});
	
				let deployedCount = []
	
				for (const [key, value] of Object.entries(count)) {
					deployedCount.push(`${key}: ${value}`);
				}
	
				if (deployedCount[0] == undefined) {
					deployedCount.push(`${target.tag} deployed nothing!`)
				}
	
				deployedCount = deployedCount.join('\n');
	
				let itemSect = `${target.tag} has nothing!`;
				let workerSect = `${target.tag} is maidenless!`
				let cash = (`${currency.getBalance(target.id).toFixed(2)} ⵇ`);
				
				if (!items.length) itemSect = (`${target.tag} has nothing!`);
				else {itemSect = `${items.map(i => {if(i.item.name == 'Gas Lantern'){return} return `${i.amount} ${i.item.name}`}).join('\n')}`}
	
				itemSect = itemSect.replace('Inf', '∞');
	
				if (!workers.length) workerSect = (`${target.tag} is maidenless!`);
				else{workerSect = `${workers.map(i => `${i.amount} ${i.worker.name}`).join('\n')}`}
	
				if (target.id == 1010227827481784411){
					deployedCount = "Ace: 1"
				}
	
				const infoEmbed = {
					color: 0x2c806a,
					title: `${target.tag}'s Backpack`,
					image: {
						url: target.displayAvatarURL({ dynamic: true, size: 256 * 2}),
					},
					fields: [
						{ name: 'Money', value: `${cash}`},
						{ name: 'Items', value: `${itemSect}`},
						{ name: 'Workers', value: `${workerSect}`},
						{ name: 'Deployed Workers', value: `${deployedCount}`},
					],
					timestamp: new Date().toISOString(),
				}
				interaction.reply({ content: `You don't have a Gas Lantern, dumbass.`}); 
				await wait(1000)
				interaction.followUp({embeds: [infoEmbed]})
				return { message: await interaction.fetchReply() };
			
			}
			else if (item.name == "Egg Borgur" && interaction.member.user.id == 718599764173914193) {interaction.reply(`You love Egg Borgur too much to sell it.`); return { message: await interaction.fetchReply() };}
			else if (item.name == "Fate's Brain") {interaction.reply(`Look, you worked super hard to get this, someone would have to fight you for it.`); return { message: await interaction.fetchReply() };}
		
			
			currency.add(interaction.member.user.id, amount*(item.cost*0.85).toFixed(2));
			for (k=1; k <= amount; k++){
				await user.removeItem(item);
			}
			await interaction.reply(`You've sold ${amount}: ${item.name} for ${amount*(item.cost*0.85).toFixed(2)} ⵇ.`)
		} else {
			await interaction.reply(`You don't have ${amount} ${item.name}.`)
		}

		return { message: `You've sold ${amount}: ${item.name} for ${amount*(item.cost*0.85).toFixed(2)} ⵇ.` }
		},
	async args(interaction) {
		return { none: "None",}
	},
};