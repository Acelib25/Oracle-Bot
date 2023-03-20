/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock, Collection } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop, Workers, WorkerShop } = require('../dbObjects.js');
const { Op } = require('sequelize');
//const { currency } = require('../oracle.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('top')
		.setDescription('The richest fuckers'),
        //.addStringOption(option => option.setName('item').setDescription('What would you like to buy?')),
	async execute(interaction, currency) {
		let netUsers = currency.filter(user => interaction.guild.members.cache.has(user.user_id)).map(user => user);
		let networth = new Collection();
		for(const user of netUsers) {
			let sum = 0;

			const userObj = await Users.findOne({ where: { user_id: user.user_id } });
			const items = await userObj.getItems();
			const deployed = await Workers.findAll({ where: { user_id: user.user_id } });	
        	const workers = await userObj.getWorkers();
        	const workerID = deployed.map(i => `${i.worker_id}`);

			const itemsHad = items.map(i => `${i.item.name}`);
			const numberHad = items.map(i => `${i.amount}`);

			let count = workerID.reduce((cnt, cur) => (cnt[cur] = cnt[cur] + 1 || 1, cnt), {});

			for (const [key, value] of Object.entries(count)) {
				const worker = await WorkerShop.findOne({ where: { name: { [Op.like]: key } } });
				sum += worker.cost*parseInt(value);
			}

			

			for(let k=0; k < itemsHad.length; k++){
				const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemsHad[k] } } });
				
				if (item.name == "Ember") {}
				else if (item.name == "Dragon's Fang") {}
				else if (item.name == "Bag of Volts"){} 
				else if (item.name == "The Fisherman's Wife") {}
				else if (item.name == "Gas Lantern") {}
				else if (item.name == "Egg Borgur" && interaction.member.user.id == 718599764173914193) {}
				else if (item.name == "Fate's Brain") {}
				else if (item.name == "Gun") {}
				else if (item.name == "null") {}
				else if (item.name == "Greg") {}
				else {
					for (let j=0; j < numberHad[k]; j++){
						sum += 1*(item.cost*0.85)
					}			
				}
			}

			
			networth.set(user.user_id, {user_id: user.user_id, networth: sum+user.balance})
		}
		console.log(await netUsers);
		console.log(await networth);
		interaction.reply(
            networth.sort((a, b) => b.networth - a.networth)
				.filter(user => interaction.guild.members.cache.has(user.user_id))
                .first(30)
                .map((user, position) => `(${position + 1}) ${(interaction.guild.members.cache.get(user.user_id).user.username)}: ${parseFloat(user.networth).toFixed(2)} ⵇ`)
                .join('\n'),
            { code: true }
        );

		return { message: `Richies`, args: {none: "none"} }
		},
	async url(guild, channel, currency) {
		let netUsers = currency.filter(user => guild.members.cache.has(user.user_id)).map(user => user);
		let networth = new Collection();
		for(const user of netUsers) {
			let sum = 0;

			const userObj = await Users.findOne({ where: { user_id: user.user_id } });
			const items = await userObj.getItems();
			const deployed = await Workers.findAll({ where: { user_id: user.user_id } });	
        	const workers = await userObj.getWorkers();
        	const workerID = deployed.map(i => `${i.worker_id}`);

			const itemsHad = items.map(i => `${i.item.name}`);
			const numberHad = items.map(i => `${i.amount}`);

			let count = workerID.reduce((cnt, cur) => (cnt[cur] = cnt[cur] + 1 || 1, cnt), {});

			for (const [key, value] of Object.entries(count)) {
				const worker = await WorkerShop.findOne({ where: { name: { [Op.like]: key } } });
				sum += worker.cost*parseInt(value);
			}

			

			for(let k=0; k < itemsHad.length; k++){
				const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemsHad[k] } } });
				
				if (item.name == "Ember") {}
				else if (item.name == "Dragon's Fang") {}
				else if (item.name == "Bag of Volts"){} 
				else if (item.name == "The Fisherman's Wife") {}
				else if (item.name == "Gas Lantern") {}
				else if (item.name == "Egg Borgur" && user.user_id == 718599764173914193) {}
				else if (item.name == "Fate's Brain") {}
				else if (item.name == "Gun") {}
				else if (item.name == "null") {}
				else if (item.name == "Greg") {}
				else {
					for (let j=0; j < numberHad[k]; j++){
						sum += 1*(item.cost*0.85)
					}			
				}
			}

			
			networth.set(user.user_id, {user_id: user.user_id, networth: sum+user.balance})
		}
		console.log(await netUsers);
		console.log(await networth);
		channel.send(
			networth.sort((a, b) => b.networth - a.networth)
				.filter(user => guild.members.cache.has(user.user_id))
                .first(30)
                .map((user, position) => `(${position + 1}) ${(guild.members.cache.get(user.user_id).user.username)}: ${parseFloat(user.networth).toFixed(2)} ⵇ`)
                .join('\n'),
            { code: true }
		);
		},
	async args(interaction) {
		return { none: "None",}
	},
};