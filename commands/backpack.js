/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop, WorkerShop, Workers } = require('../dbObjects.js');
const { Op } = require('sequelize');
const aceslib = require('../../aceslib.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('backpack')
		.setDescription('Check your backpack.')
        .addUserOption(option => option.setName('user').setDescription('Who? (Leave blank for yourself)')),
	async execute(interaction, currency) {
		
        await interaction.deferReply();
        const target = interaction.options.getUser('user') ?? interaction.member.user;
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
        else {itemSect = `${items.map(i => `${i.amount} ${i.item.name}`).join('\n')}`}

        itemSect = itemSect.replace('Inf', '∞');

        if (!workers.length) workerSect = (`${target.tag} is maidenless!`);
		else{workerSect = `${workers.map(i => `${i.amount} ${i.worker.name}`).join('\n')}`}

        if (target.id == 1010227827481784411){
            deployedCount = "Ace: 1"
        }

        const infoEmbed = {
            color: 0x2c806a,
            title: `${target.tag}'s Backpack`,
            fields: [
                { name: 'Money', value: `${cash}`},
                { name: 'Items', value: `${itemSect}`},
                { name: 'Workers', value: `${workerSect}`},
                { name: 'Deployed Workers', value: `${deployedCount}`},
			],
            timestamp: new Date().toISOString(),
		}
		interaction.editReply({ embeds: [infoEmbed] })
        //aceslib.embed(interaction.client, infoEmbed);
    	return { message: "[EMBED]", args: {none:"none"} }
	},
	async args(interaction) {
		return { none: "None",}
	},
};