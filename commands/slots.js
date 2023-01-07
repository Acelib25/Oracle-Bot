/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, AttachmentBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { Discord } = require('discord.js');
const axios = require('axios');
const fs = require('node:fs');
const wait = require('node:timers/promises').setTimeout;
const aceslib = require('../../aceslib');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slots')
		.setDescription('Roll the dice!')
        .addNumberOption(option => option.setName('bet').setDescription('How much will you bet?').setRequired(true).setMinValue(0.25)),
	async execute(interaction, currency) {

        await interaction.reply("Loading");
        const bet = interaction.options.getNumber('bet');

        function isNumeric(num){
			return !isNaN(num)
		}
        if(parseInt(currency.getBalance(interaction.member.user.id)) <  bet && bet != 625){
            return await interaction.editReply("You don't have that much to bet!")
        }
        let rolls = [':moneybag:',':low_brightness:',':star:',':cherries:',':heart:',':game_die:']
        function choose(choices) {
            var index = Math.floor(Math.random() * choices.length);
            return choices[index];
        }
        function randomBetween(min, max) { 
            return Math.floor(Math.random() * (max - min + 1) + min)
        }
        
        

        let slot1 = randomBetween(0,5);
        let slot2 = randomBetween(0,5);
        let slot3 = randomBetween(0,5);

        let preset = `Slots: ${slot1} ${slot2} ${slot3}`

        let slot1top,slot2top,slot3top,slot1bottom,slot2bottom,slot3bottom;

        let a = 0;
        let b = 0;

        let stat = "....";

        //await interaction.reply("Loading");

        // n n-1 n-1 is what you want to roll to win
        /*
        0 5 5
        1 0 0
        2 1 1
        3 2 2
        4 3 3 
        5 4 4
        */

        for(k=0; k < 16; k++){
            if ( a < 8) {
                slot1++
                a++
                if (slot1 > 5){
                    slot1 = 0;
                }
            }
            if ( b < 12) {
                slot2++
                b++
                if (slot2 > 5){
                    slot2 = 0;
                }
            }
            
            slot3++
            if (slot3 > 5){
                slot3 = 0;
            }

            slot1top = slot1 - 1;
            slot2top = slot2 - 1;
            slot3top = slot3 - 1;

            slot1bottom = slot1 + 1;
            slot2bottom = slot2 + 1;
            slot3bottom = slot3 + 1;

            if(slot1top < 0 ){slot1top = 5}
            if(slot2top < 0 ){slot2top = 5}
            if(slot3top < 0 ){slot3top = 5}
            if(slot1bottom > 5 ){slot1bottom = 0}
            if(slot2bottom > 5 ){slot2bottom = 0}
            if(slot3bottom > 5 ){slot3bottom = 0}

            await interaction.editReply(`╔════[SLOTS]════╗\n║   ${rolls[slot1top]}  ║  ${rolls[slot2top]}  ║  ${rolls[slot3top]}     ║\n>> ${rolls[slot1]}   ║  ${rolls[slot2]}  ║  ${rolls[slot3]}  <<\n║   ${rolls[slot1bottom]}  ║  ${rolls[slot2bottom]}  ║  ${rolls[slot3bottom]}     ║\n╚════[SLOTS]════╝\n\nYou bet ${bet} ⵇ and you${stat}`)

            await wait(250);

        }

        if (bet == 625){
            stat = `\n\n DEBUG:\n Start: ${preset}\n End: Slots: ${slot1} ${slot2} ${slot3}`;
        }
        else if(slot1 == slot2 && slot2 == slot3){  
            stat = ` Win! Your bet was doubled!\nYou gained ${bet*2} ⵇ`
            currency.add(interaction.member.user.id, bet*2);
        } 
        else if(slot1 == slot2 || slot2 == slot3){
            stat = ` Got 2 in a row! I'll let you keep your money.\nYou lost 0 ⵇ`
        }
        else if(slot1 == slot2 || slot2 == slot3 || slot1 == slot3){
            stat = ` Got 2 out of 3! I'll go halfsies with ya. :stuck_out_tongue_winking_eye:\nYou lost ${bet/2} ⵇ`
            currency.add(interaction.member.user.id, -bet/2);
        }
        else {
            stat = ` Lose! Bye bye money. :(\nYou lost ${bet} ⵇ`
            currency.add(interaction.member.user.id, -bet);
        }
        await wait(250);
        aceslib.msg(interaction.client, `Start: ${preset}\n End: Slots: ${slot1} ${slot2} ${slot3}`)
        await interaction.editReply(`╔════[SLOTS]════╗\n║   ${rolls[slot1top]}  ║  ${rolls[slot2top]}  ║  ${rolls[slot3top]}     ║\n>> ${rolls[slot1]}   ║  ${rolls[slot2]}  ║  ${rolls[slot3]}  <<\n║   ${rolls[slot1bottom]}  ║  ${rolls[slot2bottom]}  ║  ${rolls[slot3bottom]}     ║\n╚════[SLOTS]════╝\n\nYou bet ${bet} ⵇ and you${stat}`)
		
        return { message: await interaction.fetchReply() }
	},
    async args(interaction) {
		const bet = interaction.options.getNumber('bet');
		return { bet: bet }
	},
};