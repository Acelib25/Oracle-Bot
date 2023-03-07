/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock, AttachmentBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop, WorkerShop, Workers } = require('../dbObjects.js');
const { Op } = require('sequelize');
const aceslib = require('../../aceslib');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('worker')
		.setDescription('Do some work!')
        .addSubcommand(sub => 
			sub
			.setName('shop')
            .setDescription('See workers!'),
		)
        .addSubcommand(sub => 
			sub
			.setName('buy')
            .setDescription('Buy workers!')
            .addStringOption(option => option.setName('item').setDescription('Who would you like to buy?')),
		)
        .addSubcommand(sub => 
			sub
			.setName('deploy')
            .setDescription('Deploy your workers!')
            .addStringOption(option => option.setName('worker').setDescription('Who would you like to put to work?')),
		)
        .addSubcommand(sub => 
			sub
			.setName('retrieve')
            .setDescription('Retrieve a worker.')
            .addStringOption(option => option.setName('worker').setDescription('Who would you like to pull from work?')),
		)
        .addSubcommand(sub => 
			sub
			.setName('claim')
            .setDescription('Claim rewards.')
		),
	async execute(interaction, currency) {

        function addMinutes(date, minutes) {
            return new Date(date.getTime() + minutes*60000);
        }

        function weighted_random(options) {
            var i;
        
            var weights = [];
        
            for (i = 0; i < options.length; i++)
                weights[i] = options[i].weight + (weights[i - 1] || 0);
            
            var random = Math.random() * weights[weights.length - 1];
            
            for (i = 0; i < weights.length; i++)
                if (weights[i] > random)
                    break;
            
            return options[i].item;
        }
        
        if (interaction.options.getSubcommand() === 'shop') {
            const items = await WorkerShop.findAll();
            await interaction.reply(codeBlock(items.map(i => `${i.name}: ${i.cost} ⵇ`).join('\n')));
            return { message: await interaction.fetchReply() }
        }
        
        else if (interaction.options.getSubcommand() === 'buy') {
            const itemName = interaction.options.getString('item');
            const item = await WorkerShop.findOne({ where: { name: { [Op.like]: itemName } } });

            if (!item) return interaction.reply(`That worker doesn't exist.`);
            
            if (item.cost > currency.getBalance(interaction.member.user.id).toFixed(2)) {
                return interaction.reply(`You currently have ${currency.getBalance(interaction.member.user.id).toFixed(2)} ⵇ, but the ${item.name} costs ${item.cost} ⵇ!`);
            }
            let d = new Date();
            let stamp = addMinutes(d, 60);
            let wrk = await Workers.create({
                user_id: interaction.member.user.id,
                claim_stamp: stamp.valueOf(),
                worker_id: item.name,
            }); 
                
            console.log(stamp);
            currency.add(interaction.member.user.id, item.cost * -1);
            await interaction.reply(`You bought and deployed ${itemName}, you can claim their rewards on [${stamp.toDateString()}] at [${stamp.toTimeString()}].`)
            return { message: await interaction.fetchReply() }
        }
        
        else if (interaction.options.getSubcommand() === 'deploy') {
            const workerName = interaction.options.getString('worker');
            const worker = await WorkerShop.findOne({ where: { name: { [Op.like]: workerName } } });
		
            const user = await Users.findOne({ where: { user_id: interaction.member.user.id } });
            const workers = await user.getWorkers();

            const workersHad = workers.map(i => `${i.worker.name}`);
            const numberHad = workers.map(i => `${i.amount}`);

            console.log(workersHad)
            console.log(numberHad)
            
            if (workersHad.includes(`${worker.name}`) && numberHad[workersHad.indexOf(worker.name)] > 0){
                let d = new Date();
                let stamp = addMinutes(d, 60);
                let wrk = await Workers.create({
                    user_id: interaction.member.user.id,
                    claim_stamp: stamp.valueOf(),
                    worker_id: worker.name,
                }); 
                
                console.log(stamp);
                
                await interaction.reply(`You deployed ${workerName}, you can claim their rewards on [${stamp.toDateString()}] at [${stamp.toTimeString()}].`)
                await user.removeWorker(worker);
            } else {
                await interaction.reply(`You don't have ${workerName}.`)
            }
                return { message: await interaction.fetchReply() }
        
        }

        else if (interaction.options.getSubcommand() === 'retrieve') {        
            const workerName = interaction.options.getString('worker');
            const worker = await WorkerShop.findOne({ where: { name: { [Op.like]: workerName } } });
		
            const user = await Users.findOne({ where: { user_id: interaction.member.user.id } });
            
            if (worker != null){
                await user.undeployWorker(worker);
                                
                await interaction.reply(`You recaptured ${workerName}, they have been stuffed back into your backpack for safe keeping. :)`)
                
                await user.addWorker(worker);
            } else {
                await interaction.reply(`You don't have ${workerName} deployed.`)
            }
                return { message: await interaction.fetchReply() }
        }

        else if (interaction.options.getSubcommand() === 'claim') {
            await interaction.reply({content: "You got a lot, this might take a moment...\n"});
            const deployed = await Workers.findAll({ where: { user_id: interaction.member.user.id } });

            const stamp = deployed.map(i => {
                let d = new Date().valueOf();
                if (i.claim_stamp <= d){
                    return i.claim_stamp
                }
            });
            const workerID = deployed.map(i => {
                let d = new Date().valueOf();
                if (i.claim_stamp <= d){
                    return i.worker_id
                }
            });


            console.log(stamp)
            console.log(workerID)

            let log = [];

            log.push(`stamp: ${stamp}`);
            log.push(`workerID: ${workerID}`)

            let d = new Date().valueOf();
            let msg = ['Here are your results:'];
            let index = -1;
            const user = await Users.findOne({ where: { user_id: interaction.member.user.id } });
            let bye = await Workers.destroy({ where: { claim_stamp: { [Op.lte]: d }, user_id: interaction.member.user.id } })

            console.log(`; ${bye}`)

            for(element in stamp){
                let pity = 0;
                let opt = [];
                let z,de,stamp,wrk,obj,item, tmp;
                index++;
                if (element <= d){
                    console.log(workerID[index]);
                    console.log(index)
                    log.push(`worker(${index}): ${workerID[index]}`)
                    switch (workerID[index]){
                        case 'Beggar':
                            pity = 0;
                            opt = [
                                {item: 0, weight: 1000 }, 
                                {item: 0.1, weight: 400 }, 
                                {item: 0.5, weight: 400 }, 
                                {item: 0.75, weight: 200 }, 
                                {item: 1, weight: 100 },
                                {item: 5, weight: 50 },
                                {item: 10, weight: 5 }
                            ]
                            z = 0;
                            while(z < 10){
                                z++
                                pity += weighted_random(opt);
                            }
                            currency.add(interaction.member.user.id, pity);
                            de = new Date();
                            stamp = addMinutes(de, 60);
                            wrk = Workers.create({
                                user_id: interaction.member.user.id,
                                claim_stamp: stamp.valueOf(),
                                worker_id: "Beggar",
                            });
                            obj = codeBlock(aceslib.workerMessages.beggar(pity));
                            msg.push(obj);
                            break;
                        case 'Waitress':
                            pity = "Nothin";
                            opt = [
                                {item: "Tea", weight: 50 }, 
                                {item: "Coffee", weight: 40 }, 
                                {item: "Cake", weight: 10 },
                                {item: "Egg Borgur", weight: 1 }
                            ]
                            pity = weighted_random(opt);
                            de = new Date();
                            stamp = addMinutes(de, 60);
                            wrk = Workers.create({
                                user_id: interaction.member.user.id,
                                claim_stamp: stamp.valueOf(),
                                worker_id: "Waitress",
                            });
                            obj = codeBlock(aceslib.workerMessages.waitress(pity));
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            tmp = await user.addItem(item)
                            aceslib.msg(interaction.client, `Added ${item.name} to ${interaction.member.user.tag}\n\n ${tmp}`)
                            break;
                        case 'Teacher':
                            pity = "Nothin";
                            opt = [
                                {item: "Ruler", weight: 10 }, 
                                {item: "Apple", weight: 20 }, 
                                {item: "B+ paper", weight: 25 },
                                {item: "A+ paper", weight: 15 }
                            ]
                            pity = weighted_random(opt);
                            de = new Date();
                            stamp = addMinutes(de, 60);
                            wrk = Workers.create({
                                user_id: interaction.member.user.id,
                                claim_stamp: stamp.valueOf(),
                                worker_id: "Teacher",
                            });
                            obj = codeBlock(aceslib.workerMessages.teacher(pity));
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            tmp = await user.addItem(item)
                            aceslib.msg(interaction.client, `Added ${item.name} to ${interaction.member.user.tag}\n\n ${tmp}`)
                            break;
                        case 'Miner':
                            pity = "Nothin";
                            opt = [
                                {item: "Gold", weight: 15 },
                                {item: "Iron", weight: 30 }, 
                                {item: "Coal", weight: 50 }, 
                            ]
                            pity = weighted_random(opt);
                            de = new Date();
                            stamp = addMinutes(de, 60);
                            wrk = Workers.create({
                                user_id: interaction.member.user.id,
                                claim_stamp: stamp.valueOf(),
                                worker_id: "Miner",
                            });
                            obj = codeBlock(aceslib.workerMessages.miner(pity));
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            tmp = await user.addItem(item)
                            aceslib.msg(interaction.client, `Added ${item.name} to ${interaction.member.user.tag}\n\n ${tmp}`)
                            break;
                        case 'Fisher':
                            pity = "Nothin";
                            opt = [
                                {item: "Old Boot", weight: 40 },
                                {item: "Dull Fish", weight: 30 }, 
                                {item: "Shiny Fish", weight: 15 }, 
                                {item: "Fishy Fish", weight: 10 },
                                {item: "Wet Cell Phone", weight: 5 }
                            ]
                            pity = weighted_random(opt);
                            de = new Date();
                            stamp = addMinutes(de, 60);
                            wrk = Workers.create({
                                user_id: interaction.member.user.id,
                                claim_stamp: stamp.valueOf(),
                                worker_id: "Fisher",
                            });
                            obj = codeBlock(aceslib.workerMessages.fisher(pity));
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            tmp = await user.addItem(item)
                            aceslib.msg(interaction.client, `Added ${item.name} to ${interaction.member.user.tag}\n\n ${tmp}`)
                            break;
                        case 'Corn Star':
                            pity = "Nothin";
                            opt = [
                                {item: "Colacaine", weight: 15 },
                                {item: "Veed", weight: 30 }, 
                                {item: "Cake", weight: 5 }, 
                                {item: "Fishy Fish", weight: 50 }
                            ]
                            pity = weighted_random(opt);
                            de = new Date();
                            stamp = addMinutes(de, 60);
                            wrk = Workers.create({
                                user_id: interaction.member.user.id,
                                claim_stamp: stamp.valueOf(),
                                worker_id: "Corn Star",
                            });
                            obj = codeBlock(aceslib.workerMessages.cornstar(pity));
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            tmp = await user.addItem(item)
                            aceslib.msg(interaction.client, `Added ${item.name} to ${interaction.member.user.tag}\n\n ${tmp}`)
                            break;
                        case 'Rug Dealer':
                            pity = "Nothin";
                            opt = [
                                {item: "Colacaine", weight: 30 },
                                {item: "Veed", weight: 50 }, 
                                {item: "DSD", weight: 15 }, 
                                {item: "Pjizz", weight: 5 }
                            ]
                            pity = weighted_random(opt);
                            de = new Date();
                            stamp = addMinutes(de, 60);
                            wrk = Workers.create({
                                user_id: interaction.member.user.id,
                                claim_stamp: stamp.valueOf(),
                                worker_id: "Rug Dealer",
                            });
                            obj = codeBlock(aceslib.workerMessages.rugdealer(pity));
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            tmp = await user.addItem(item)
                            aceslib.msg(interaction.client, `Added ${item.name} to ${interaction.member.user.tag}\n\n ${tmp}`)
                            break;
                        case 'Haxor':
                            pity = "Nothin";
                            opt = [
                                {item: "Pineapple", weight: 50 }, 
                                {item: "Bash", weight: 40 }, 
                                {item: "RAM", weight: 10 }
                            ]
                            pity = weighted_random(opt);
                            de = new Date();
                            stamp = addMinutes(de, 60);
                            wrk = Workers.create({
                                user_id: interaction.member.user.id,
                                claim_stamp: stamp.valueOf(),
                                worker_id: "Haxor",
                            });
                            obj = codeBlock(aceslib.workerMessages.haxor(pity));
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            tmp = await user.addItem(item)
                            aceslib.msg(interaction.client, `Added ${item.name} to ${interaction.member.user.tag}\n\n ${tmp}`)
                            break;
                    }       
                } 
            } 
            console.log(msg);

            log.push(`msg: {\n${msg.join("\n")}\n}`)

            if (msg.toString().replace(/([\,])+/g, "\n").length >= 2000) {
                if (msg.length > 10) {
                    for (let i = 0; i < 10; i++){
                        //console.log(`A:\n\n\n${i}`);
                        interaction.followUp({content: msg[i]});
                    }
                    interaction.followUp(`Plus ${msg.length - 10} more...`)
                }
                else {
                    for (const i of msg){
                        //console.log(`A:\n\n\n${i}`);
                        interaction.followUp({content: i});
                    }
                }
                let de2 = new Date();
                let stamp2 = addMinutes(de2, 60);
                await interaction.followUp(`Your workers will be ready again at [${stamp2.toDateString()}] at [${stamp2.toTimeString()}]`);
            } else {
                await interaction.followUp({content: msg.join("\n")});
                let de2 = new Date();
                let stamp2 = addMinutes(de2, 60);
                await interaction.followUp(`Your workers will be ready again at [${stamp2.toDateString()}] at [${stamp2.toTimeString()}]`);
            }

            console.log("Done")
            return { message: 'E' }
        }

		
	},
	async args(interaction) {
		return { none: "None",}
	},
};

/*

const target = interaction.options.getUser('user') ?? interaction.member.user;
		const user = await Users.findOne({ where: { user_id: target.id } });
		const items = await user.getItems();

		if (!items.length) return interaction.reply(`${target.tag} has nothing!`);

		await interaction.reply(`${target.tag} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
		return { message: await interaction.fetchReply() }

*/