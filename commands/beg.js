const { SlashCommandBuilder, codeBlock } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../dbObjects.js');
const { Op, BelongsTo } = require('sequelize');
const { kMaxLength } = require('node:buffer');
let blacklist = [];
let place = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('beg')
		.setDescription('Beg for money'),
	async execute(interaction, currency) {
		await interaction.deferReply();
        //await interaction.editReply("Stop begging and get a job! Ace aint fixing this command anytime soon.")
        //return { message: await interaction.fetchReply() }

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

        async function beg(){
            console.log("Start Begging")
            let z = place[blacklist.indexOf(interaction.member.user.id)]
            while(z < 10){
                z++
                await wait(30000)
                pity = weighted_random(opt);
                currency.add(interaction.member.user.id, pity);
                message.push(`${z}/10 tries: You got ${pity} ⵇ.`);
                await interaction.editReply(message.toString().replace(/([\,])+/g, "\n"))
                place[blacklist.indexOf(interaction.member.user.id)] = z;
            }

            blacklist = blacklist.filter(function(value, index, arr){ 
                return value != interaction.member.user.id;
            });
            place = place.filter(function(value, index, arr){ 
                return value < 11;
            });

            return "Done Begging";
        }

        if (blacklist.includes(interaction.member.user.id)){return interaction.editReply("You begged louder but no one cares...")}

        let opt = [
            {item: 0, weight: 2000 }, 
            {item: 0.1, weight: 500 }, 
            {item: 0.5, weight: 500 }, 
            {item: 0.75, weight: 300 }, 
            {item: 1, weight: 200 },
            {item: 5, weight: 100 },
            {item: 10, weight: 50 },
            {item: -5, weight: 1 }
        ]
        
        let pity = 0;
        let message = ["Begging for 5 min..."]
        blacklist.push(interaction.member.user.id);
        place.push(0);
        await interaction.editReply(message.toString().replace(/([\,])+/g, "\n"))

        let done = await beg();

        console.log(done);

        return { message: await interaction.fetchReply() }
		},
	async args(interaction) {
		return { none: "None",}
	},
};