/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { Discord } = require('discord.js');
const axios = require('axios');
const fs = require('node:fs');
const { resolveNaptr } = require('node:dns');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bonk')
		.setDescription('Bonk a hoe')
		.addUserOption(option => option.setName('target').setDescription('Who is horny?').setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('Why they horny?'))
        .addBooleanOption(option => option.setName('ping').setDescription('Want to ping them?')),
	async execute(interaction) {
		let image = "https://i.imgur.com/QFcD0kw.png"
        const canvas = Canvas.createCanvas(720, 492);
        const ctx = canvas.getContext('2d');
		const user = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason');
        const pingpong = interaction.options.getBoolean('ping');
        const background = await Canvas.loadImage(image)
        .catch(error => {
          writelog(error);
          interaction.reply("Oops `Error: 403`, tell Ace to fix this. Try again.");
        })
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
            interaction.reply({ content: `<@${user.id}> has been bonked because ${reason}!!!!`, files: [attachment] })
        } else if (reason && !pingpong){
            interaction.reply({ content: `${user.username} has been bonked because ${reason}!!!!`, files: [attachment] })
        } 
        else if (pingpong){
            interaction.reply({ content: `<@${user.id}> has been bonked!!!!`, files: [attachment] })
        } 
        else {
            interaction.reply({ content: `${user.username} has been bonked!!!!`, files: [attachment] })
        }
        return { message: await interaction.fetchReply() }
	},
    async args(interaction) {
		const user = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason');
        const pingpong = interaction.options.getBoolean('ping');
		return { target: user, reason: reason, ping: pingpong }
	},
};