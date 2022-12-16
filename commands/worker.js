/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop, WorkerShop, Workers } = require('../dbObjects.js');
const { Op } = require('sequelize');

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
            const user = await Users.findOne({ where: { user_id: interaction.member.user.id } });
            if(interaction.member.user.id != '344143763918159884') {currency.add(interaction.member.user.id, item.cost * -1)};
            await user.addWorker(item);
            currency.add(interaction.member.user.id, item.cost * -1);

            await interaction.reply(`You've bought: ${item.name}.`);
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
            await interaction.reply("Ya, this has not been added yet. If you really want to remove your sla-I mean worker, talk to Ace.")
        }

        else if (interaction.options.getSubcommand() === 'claim') {
            const deployed = await Workers.findAll({ where: { user_id: interaction.member.user.id } });

            const stamp = deployed.map(i => i.claim_stamp);
            const workerID = deployed.map(i => `${i.worker_id}`);

            console.log(stamp)
            console.log(workerID)

            let d = new Date().valueOf();
            let msg = ['Here are your results:'];
            let index = -1;
            const user = await Users.findOne({ where: { user_id: interaction.member.user.id } });

            stamp.forEach( async element => {
                let pity = 0;
                let opt = [];
                let z,de,stamp,wrk,obj,item;
                index++;
                if (element <= d){
                    console.log(workerID[index]);
                    console.log(index)
                    switch (workerID[index]){
                        case 'Begger':
                            pity = 0;
                            opt = [
                                {item: 0, weight: 2000 }, 
                                {item: 0.1, weight: 300 }, 
                                {item: 0.5, weight: 300 }, 
                                {item: 0.75, weight: 100 }, 
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
                                worker_id: "Begger",
                            });
                            obj = codeBlock(`Your favorite Begger begged and bagged ${pity} ⵇ for you! They will be ready again on [${stamp.toDateString()}] at [${stamp.toTimeString()}]`);
                            msg.push(obj);
                            break;
                        case 'Waitress':
                            pity = "Nothin";
                            opt = [
                                {item: "Tea", weight: 50 }, 
                                {item: "Coffee", weight: 40 }, 
                                {item: "Cake", weight: 10 }
                            ]
                            pity = weighted_random(opt);
                            de = new Date();
                            stamp = addMinutes(de, 60);
                            wrk = Workers.create({
                                user_id: interaction.member.user.id,
                                claim_stamp: stamp.valueOf(),
                                worker_id: "Waitress",
                            });
                            obj = codeBlock(`Your waitress gave you a ${pity} on the house! They may give you something again after [${stamp.toDateString()}] at [${stamp.toTimeString()}]`);
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            user.addItem(item);
                            break;
                        case 'Teacher':
                            pity = "Nothin";
                            opt = [
                                {item: "Ruler", weight: 30 }, 
                                {item: "Apple", weight: 50 }, 
                                {item: "B+ paper", weight: 15 },
                                {item: "A+ paper", weight: 5 }
                            ]
                            pity = weighted_random(opt);
                            de = new Date();
                            stamp = addMinutes(de, 60);
                            wrk = Workers.create({
                                user_id: interaction.member.user.id,
                                claim_stamp: stamp.valueOf(),
                                worker_id: "Teacher",
                            });
                            obj = codeBlock(`Your old school teacher gave you a ${pity} that you forgot when you dropped out all those years ago! Who knows what else they might find after [${stamp.toDateString()}] at [${stamp.toTimeString()}]`);
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            user.addItem(item);
                            break;
                        case 'Miner':
                            pity = "Nothin";
                            opt = [
                                {item: "Gold", weight: 5 },
                                {item: "Iron", weight: 15 }, 
                                {item: "Coal", weight: 30 }, 
                                {item: "Entropy", weight: 50 }
                            ]
                            pity = weighted_random(opt);
                            de = new Date();
                            stamp = addMinutes(de, 60);
                            wrk = Workers.create({
                                user_id: interaction.member.user.id,
                                claim_stamp: stamp.valueOf(),
                                worker_id: "Miner",
                            });
                            obj = codeBlock(`A miner threw a chunk of ${pity} at you! He looked pretty angry, best if you don't come back till after [${stamp.toDateString()}] at [${stamp.toTimeString()}]`);
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            user.addItem(item);
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
                            obj = codeBlock(`A fisher slapped you with a ${pity} after he caught you fucking *his wife* on *his boat*! Luckily the ${pity} got stuck in your mouth and you made off with it. The old geezer has alzheimer's so he should forget sometime after [${stamp.toDateString()}] at [${stamp.toTimeString()}]`);
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            user.addItem(item);
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
                            obj = codeBlock(`Your best friend (who has a very successful OnlyCorns) gifted you ${pity}... Best not ask how they got that, infact you should ignore them till after [${stamp.toDateString()}] at [${stamp.toTimeString()}]`);
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            user.addItem(item);
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
                            obj = codeBlock(`Your other best friend, a successful Rug Dealer, brought you to his Rug Den and gave you a bag of ${pity}, and asked you to be his Rug Distributor. Just sell it before someone sees you, the next batch will be ready after [${stamp.toDateString()}] at [${stamp.toTimeString()}]`);
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            user.addItem(item);
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
                                worker_id: "Waitress",
                            });
                            obj = codeBlock(`While browsing OnlyCorns your screen freezes and a pop-up saying you were mailed a free ${pity} appears! Must be that Haxor you hired to help you win Call of Booty. They may give you something again after [${stamp.toDateString()}] at [${stamp.toTimeString()}]`);
                            msg.push(obj);
                            item = await CurrencyShop.findOne({ where: { name: { [Op.like]: pity } } });
                            user.addItem(item);
                            break;
                    }
                } 
            }); 
            console.log("Done")
            console.log(msg);
            function chunkString(str) {
                let out = [];
                let inp = str.split("\n")
                let z = 0;
                
                for(z=1; z <= inp.length; z+=5){
                    let fout = [];
                    try {
                        fout.push(inp[z-1]);
                    } catch(err){}
                    try {
                        fout.push(inp[z]);
                    } catch(err){}
                    try {
                        fout.push(inp[z+1]);
                    } catch(err){}
                    try {
                        fout.push(inp[z+2]);
                    } catch(err){}
                    try {
                        fout.push(inp[z+3]);
                    } catch(err){}
                    out.push(fout.toString().replace(/([\,])+/g, "\n"))
                }

                return out;
            }
            if (msg.toString().replace(/([\,])+/g, "\n").length >= 2000) {
                await interaction.reply({content: "You got a lot, please give me a moment...\n", ephemeral: true});
                for (const i of chunkString(msg.toString().replace(/([\,])+/g, "\n"))){
                    //console.log(`A:\n\n\n${i}`);
                    interaction.followUp({content: i, ephemeral: true});
                }
            } else {
                await interaction.reply({content: msg.toString().replace(/([\,])+/g, "\n"), ephemeral: true});
            }
            Workers.destroy({ where: { claim_stamp: { [Op.lte]: d }, user_id: interaction.member.user.id } })
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