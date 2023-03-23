/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock, AttachmentBuilder, Collection, ChatInputCommandInteraction } = require('discord.js');
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
            .addStringOption(option => option.setName('item').setDescription('Who would you like to buy?'))
            .addIntegerOption(option => option.setName('amount').setDescription('How many?').setMinValue(1)),
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

        ChatInputCommandInteraction.prototype.ghost = async function(content){
            this.reply({content: content, ephemeral: true});
        }

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
            await interaction.ghost(codeBlock(items.map(i => `${i.name}: ${i.cost} ⵇ`).join('\n')));
            return { message: await interaction.fetchReply() }
        }
        
        else if (interaction.options.getSubcommand() === 'buy') {
            const itemName = interaction.options.getString('item');
            const amount = interaction.options.getInteger('amount');
            const item = await WorkerShop.findOne({ where: { name: { [Op.like]: itemName } } });

            if (!item) return interaction.ghost(`That worker doesn't exist.`);
            
            if (item.name == "Hacker GF") {return interaction.ghost(`Good luck, she is hidden behind 6 proxies, 3 VPNs, a false alias, and like 30 or so giant stuffed animals.`); return { message: await interaction.fetchReply() };}
        

            if (item.cost*amount > currency.getBalance(interaction.member.user.id).toFixed(2)) {
                return interaction.ghost(`You currently have ${currency.getBalance(interaction.member.user.id).toFixed(2)} ⵇ, but ${amount} ${item.name} costs ${item.cost*amount} ⵇ!`);
            }

            let stamp = 0;
            for(let k = 0; k < amount; k++){
                let d = new Date();
                stamp = addMinutes(d, 60);
                let wrk = await Workers.create({
                    user_id: interaction.member.user.id,
                    claim_stamp: stamp.valueOf(),
                    worker_id: item.name,
                }); 

                currency.add(interaction.member.user.id, item.cost * -1);
            }
            
            await interaction.ghost(`You bought and deployed ${amount} ${itemName}, you can claim their rewards on [${stamp.toDateString()}] at [${stamp.toTimeString()}].\nYou have ${currency.getBalance(interaction.member.user.id).toFixed(2)} ⵇ left.`)
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

            let blacklist = ["Hacker GF"];
            if (workersHad.includes(`${worker.name}`) && numberHad[workersHad.indexOf(worker.name)] > 0 && !blacklist.includes(worker.name)){
                let d = new Date();
                let stamp = addMinutes(d, 60);
                let wrk = await Workers.create({
                    user_id: interaction.member.user.id,
                    claim_stamp: stamp.valueOf(),
                    worker_id: worker.name,
                }); 
                
                console.log(stamp);
                
                await interaction.ghost(`You deployed ${workerName}, you can claim their rewards on [${stamp.toDateString()}] at [${stamp.toTimeString()}].`)
                await user.removeWorker(worker);
            } else {
                await interaction.ghost(`You don't have ${workerName} or they could not be deployed.`)
            }
                return { message: await interaction.fetchReply() }
        
        }

        else if (interaction.options.getSubcommand() === 'retrieve') {        
            const workerName = interaction.options.getString('worker');
            const worker = await WorkerShop.findOne({ where: { name: { [Op.like]: workerName } } });
		
            const user = await Users.findOne({ where: { user_id: interaction.member.user.id } });
            const workers = await Workers.findAll({ where: { user_id: interaction.member.user.id, worker_id: { [Op.like]: workerName } }  });

            const workersHad = workers.map(i => `${i.worker_id}`);
            
            if (workersHad.includes(`${worker.name}`)){
                await user.undeployWorker(worker);
                                
                await interaction.ghost(`You recaptured ${workerName}, they have been stuffed back into your backpack for safe keeping. :)`)
                
                await user.addWorker(worker);
            } else {
                await interaction.ghost(`You don't have ${workerName} deployed.`)
            }
                return { message: await interaction.fetchReply() }
        }

        else if (interaction.options.getSubcommand() === 'claim') {
            await interaction.reply({content: "This might take a moment...\n", ephemeral: true});
            const deployed = await Workers.findAll({ where: { user_id: interaction.member.user.id } });

            let workerCount = {
                "beggar":0,
                "waitress":0,
                "teacher":0,
                "miner":0,
                "fisher":0,
                "cornStar":0,
                "rugDealer":0,
                "haxor":0
            }

            const stamp = deployed.map(i => {
                let d_deployed = new Date().valueOf();
                if (i.claim_stamp <= d_deployed){
                    return i.claim_stamp
                }
            });
            const workerIDs = deployed.map(i => {
                let d_workerID = new Date().valueOf();
                if (i.claim_stamp <= d_workerID){
                    switch(i.worker_id){
                        case 'Beggar':
                            workerCount.beggar += 1;
                            break;
                        case 'Waitress':
                            workerCount.waitress += 1;
                            break;
                        case 'Teacher':
                            workerCount.teacher += 1;
                            break;
                        case 'Miner':
                            workerCount.miner += 1;
                            break;
                        case 'Fisher':
                            workerCount.fisher += 1;
                            break;
                        case 'Corn Star':
                            workerCount.cornStar += 1;
                            break;
                        case 'Rug Dealer':
                            workerCount.rugDealer += 1;
                            break;
                        case 'Haxor':
                            workerCount.haxor += 1;
                            break;
                    }
                    return i.worker_id
                }
            });  


            let d_timecheck = new Date().valueOf();
            const user = await Users.findOne({ where: { user_id: interaction.member.user.id } });
            let bye = await Workers.destroy({ where: { claim_stamp: { [Op.lte]: d_timecheck }, user_id: interaction.member.user.id } })

            let log = [];
            console.log(`;`+bye);

            let money = 0;
            for(let k = 0; k < workerCount.beggar * 10;k++){
                let opt = [
                    {item: 0, weight: 1000 }, 
                    {item: 0.1, weight: 400 }, 
                    {item: 0.5, weight: 400 }, 
                    {item: 0.75, weight: 200 }, 
                    {item: 1, weight: 100 },
                    {item: 5, weight: 50 },
                    {item: 10, weight: 5 }
                ]
                money += weighted_random(opt);
                let de = new Date();
                let stamp = addMinutes(de, 60);
                let wrk = Workers.create({
                    user_id: interaction.member.user.id,
                    claim_stamp: stamp.valueOf(),
                    worker_id: "Beggar",
                });
                //let obj = codeBlock(aceslib.workerMessages.beggar(pity));
                //msg.push(obj);
            }
            for(let k = 0; k < workerCount.waitress; k++){
                let item = "Nothin";
                let opt = [
                    {item: "Tea", weight: 50 }, 
                    {item: "Coffee", weight: 40 }, 
                    {item: "Cake", weight: 10 },
                    {item: "Egg Borgur", weight: 1 }
                ]
                item = weighted_random(opt);
                let give = await CurrencyShop.findOne({ where: { name: { [Op.like]: item } } });
                let tmp = await user.addItem(give)
                let de = new Date();
                let stamp = addMinutes(de, 60);
                let wrk = Workers.create({
                    user_id: interaction.member.user.id,
                    claim_stamp: stamp.valueOf(),
                    worker_id: "Waitress",
                });
                //obj = codeBlock(aceslib.workerMessages.waitress(pity));
                //msg.push(obj);
                
            }
            for(let k = 0; k < workerCount.teacher; k++){
                let item = "Nothin";
                let opt = [
                    {item: "Ruler", weight: 10 }, 
                    {item: "Apple", weight: 20 }, 
                    {item: "B+ paper", weight: 25 },
                    {item: "A+ paper", weight: 15 }
                ]
                item = weighted_random(opt);
                let give = await CurrencyShop.findOne({ where: { name: { [Op.like]: item } } });
                let tmp = await user.addItem(give)
                let de = new Date();
                let stamp = addMinutes(de, 60);
                let wrk = Workers.create({
                    user_id: interaction.member.user.id,
                    claim_stamp: stamp.valueOf(),
                    worker_id: "Teacher",
                });
                //obj = codeBlock(aceslib.workerMessages.waitress(pity));
                //msg.push(obj);
                
            }
            for(let k = 0; k < workerCount.miner; k++){
                let item = "Nothin";
                let opt = [
                    {item: "Gold", weight: 15 },
                    {item: "Iron", weight: 30 }, 
                    {item: "Coal", weight: 50 }, 
                ]
                item = weighted_random(opt);
                let give = await CurrencyShop.findOne({ where: { name: { [Op.like]: item } } });
                let tmp = await user.addItem(give)
                let de = new Date();
                let stamp = addMinutes(de, 60);
                let wrk = Workers.create({
                    user_id: interaction.member.user.id,
                    claim_stamp: stamp.valueOf(),
                    worker_id: "Miner",
                });
                //obj = codeBlock(aceslib.workerMessages.waitress(pity));
                //msg.push(obj);
                
            }
            for(let k = 0; k < workerCount.fisher; k++){
                let item = "Nothin";
                let opt = [
                    {item: "Old Boot", weight: 40 },
                    {item: "Dull Fish", weight: 30 }, 
                    {item: "Shiny Fish", weight: 15 }, 
                    {item: "Fishy Fish", weight: 10 },
                    {item: "Wet Cell Phone", weight: 5 }
                ]
                item = weighted_random(opt);
                let give = await CurrencyShop.findOne({ where: { name: { [Op.like]: item } } });
                let tmp = await user.addItem(give)
                let de = new Date();
                let stamp = addMinutes(de, 60);
                let wrk = Workers.create({
                    user_id: interaction.member.user.id,
                    claim_stamp: stamp.valueOf(),
                    worker_id: "Fisher",
                });
                //obj = codeBlock(aceslib.workerMessages.waitress(pity));
                //msg.push(obj);
                
            }
            for(let k = 0; k < workerCount.cornStar; k++){
                let item = "Nothin";
                let opt = [
                    {item: "Colacaine", weight: 15 },
                    {item: "Veed", weight: 30 }, 
                    {item: "Cake", weight: 5 }, 
                    {item: "Fishy Fish", weight: 50 }
                ]
                item = weighted_random(opt);
                let give = await CurrencyShop.findOne({ where: { name: { [Op.like]: item } } });
                let tmp = await user.addItem(give)
                let de = new Date();
                let stamp = addMinutes(de, 60);
                let wrk = Workers.create({
                    user_id: interaction.member.user.id,
                    claim_stamp: stamp.valueOf(),
                    worker_id: "Corn Star",
                });
                //obj = codeBlock(aceslib.workerMessages.waitress(pity));
                //msg.push(obj);
                
            }
            for(let k = 0; k < workerCount.rugDealer; k++){
                let item = "Nothin";
                let opt = [
                    {item: "Colacaine", weight: 30 },
                    {item: "Veed", weight: 50 }, 
                    {item: "DSD", weight: 15 }, 
                    {item: "Pjizz", weight: 5 }
                ]
                item = weighted_random(opt);
                let give = await CurrencyShop.findOne({ where: { name: { [Op.like]: item } } });
                let tmp = await user.addItem(give)
                let de = new Date();
                let stamp = addMinutes(de, 60);
                let wrk = Workers.create({
                    user_id: interaction.member.user.id,
                    claim_stamp: stamp.valueOf(),
                    worker_id: "Rug Dealer",
                });
                //obj = codeBlock(aceslib.workerMessages.waitress(pity));
                //msg.push(obj);
                
            }
            for(let k = 0; k < workerCount.haxor; k++){
                let item = "Nothin";
                let opt = [
                    {item: "Pineapple", weight: 50 }, 
                    {item: "Bash", weight: 40 }, 
                    {item: "RAM", weight: 10 }
                ]
                item = weighted_random(opt);
                let give = await CurrencyShop.findOne({ where: { name: { [Op.like]: item } } });
                let tmp = await user.addItem(give)
                let de = new Date();
                let stamp = addMinutes(de, 60);
                let wrk = Workers.create({
                    user_id: interaction.member.user.id,
                    claim_stamp: stamp.valueOf(),
                    worker_id: "Haxor",
                });
                //obj = codeBlock(aceslib.workerMessages.waitress(pity));
                //msg.push(obj);
                
            }

            currency.add(interaction.member.user.id, money);
            aceslib.msg(interaction.client, `Claimed:\nBeggar: ${workerCount.beggar}\nWaitress: ${workerCount.waitress}\nTeacher: ${workerCount.teacher}\nMiner: ${workerCount.miner}\nFisher: ${workerCount.fisher}\nCorn Star: ${workerCount.cornStar}\nRug Dealer: ${workerCount.rugDealer}\nHaxor: ${workerCount.haxor}`)
            await interaction.editReply({content: `This might take a moment...\n\nClaimed:\nBeggar: ${workerCount.beggar}\nWaitress: ${workerCount.waitress}\nTeacher: ${workerCount.teacher}\nMiner: ${workerCount.miner}\nFisher: ${workerCount.fisher}\nCorn Star: ${workerCount.cornStar}\nRug Dealer: ${workerCount.rugDealer}\nHaxor: ${workerCount.haxor}`, ephemeral: true});


            console.log("Done")
            return { message: `This might take a moment...\n\nClaimed:\nBeggar: ${workerCount.beggar}\nWaitress: ${workerCount.waitress}\nTeacher: ${workerCount.teacher}\nMiner: ${workerCount.miner}\nFisher: ${workerCount.fisher}\nCorn Star: ${workerCount.cornStar}\nRug Dealer: ${workerCount.rugDealer}\nHaxor: ${workerCount.haxor}` }
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

		if (!items.length) return interaction.ghost(`${target.tag} has nothing!`);

		await interaction.ghost(`${target.tag} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
		return { message: await interaction.fetchReply() }

*/
