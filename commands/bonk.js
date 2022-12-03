/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, AttachmentBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { Discord } = require('discord.js');
const axios = require('axios');
const fs = require('node:fs');
const { resolveNaptr } = require('node:dns');
let wack_id = [];
let wack_bonks = [];
let blacklist = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bonk')
		.setDescription('Bonk a hoe')
		.addUserOption(option => option.setName('target').setDescription('Who is horny?').setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('Why they horny?'))
        .addBooleanOption(option => option.setName('ping').setDescription('Want to ping them?')),
    ctx: new ContextMenuCommandBuilder()
        .setName('Bonk')
        .setType(ApplicationCommandType.User),
	async execute(interaction, currency, overwite, usr, rsn, pngpng) {
		let image = "https://i.imgur.com/QFcD0kw.png"
        const canvas = Canvas.createCanvas(720, 492);
        const ctx = canvas.getContext('2d');
		let user = interaction.options.getUser('target');
		let reason = interaction.options.getString('reason');
        let pingpong = interaction.options.getBoolean('ping');

        if (overwite){
            user = usr;
            reason = rsn;
            pingpong = pngpng;
        }

        const background = await Canvas.loadImage(image)
        .catch(error => {
          writelog(error);
          interaction.reply("Oops `Error: 403`, tell Ace to fix this. Try again.");
        })

        const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('re-bonk')
					.setLabel('Re-Bonk')
					.setStyle(ButtonStyle.Secondary)
                    .setEmoji('1047635980531802172'),
			);

        function getRandom(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        // Pick up the pen
        ctx.beginPath();
        // Start the arc to form a circle
        ctx.arc(570, 320, 100, 0, Math.PI * 2, true);
        // Put the pen down
        ctx.closePath();
        // Clip off the region you drew on
        ctx.clip();

        const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: 'jpg' }));

        ctx.drawImage(avatar, 470, 220, 200, 200);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'bonk.png' });
        if(reason && pingpong){
            interaction.reply({ content: `<@${user.id}> has been bonked because ${reason}!!!!`, files: [attachment], components: [row] })
        } else if (reason && !pingpong){
            interaction.reply({ content: `${user.username} has been bonked because ${reason}!!!!`, files: [attachment], components: [row] })
        } 
        else if (pingpong){
            interaction.reply({ content: `<@${user.id}> has been bonked!!!!`, files: [attachment], components: [row] })
        } 
        else {
            interaction.reply({ content: `${user.username} has been bonked!!!!`, files: [attachment], components: [row] })
        }
        return { message: await interaction.fetchReply() }
	},
    async press(button, currency){
        let speakers_name = button.member.nickname;
        let bonks = 'error';

        /*if(blacklist.includes(button.user.id)){
            button.reply({ content: `Woah, ${speakers_name}, you already re-bonked them!`, ephemeral: true });
            return 
        }*/

		if (speakers_name == null) {
			speakers_name = button.member.user.username;
		}
        
        if (wack_id.includes(button.message.id)){
            wack_bonks[wack_id.indexOf(button.message.id)] += 1;
            bonks = wack_bonks[wack_id.indexOf(button.message.id)]
        } else {
            wack_id.push(button.message.id);
            wack_bonks.push(1);
            bonks = wack_bonks[wack_id.indexOf(button.message.id)]
        }
        blacklist.push(button.user.id);
        button.reply(`${speakers_name} bonked x${bonks}!`);
	},
    async p_args(button, cmd_name){
        return { pressed: button.customId, origin: cmd_name }
	},
    async args(interaction) {
		const user = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason');
        const pingpong = interaction.options.getBoolean('ping');
		return { target: user, reason: reason, ping: pingpong }
	},
};