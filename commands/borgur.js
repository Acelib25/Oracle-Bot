/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { Discord } = require('discord.js');
const axios = require('axios');
const fs = require('node:fs')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('borgur')
		.setDescription('Yummi')
		.addUserOption(option => option.setName('target').setDescription('Who needs a borgur?').setRequired(true)),
	async execute(interaction) {
		let image = "https://cdn.discordapp.com/attachments/1000617928938508368/1014589364824719472/unknown-237.png"
        const canvas = Canvas.createCanvas(720, 500);
        const ctx = canvas.getContext('2d');
		const user = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason');
        const background = await Canvas.loadImage(image);
        const heart = await Canvas.loadImage('https://discordapp.com/assets/0483f2b648dcc986d01385062052ae1c.svg')
        function getRandom(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        ctx.drawImage(background, 100, 150, 200, 200);
        ctx.drawImage(heart, 310, 175, 150, 150);
        ctx.font = `60px sans-serif`;
        // Select the style that will be used to fill the text in
        ctx.fillStyle = `#00000`;
        // Actually fill the text with a solid color
        ctx.fillText("Yummi egg borgur", 150, 100);
        ctx.fillText("I love egg borgur", 160, 400);
        // Pick up the pen
        ctx.beginPath();
        // Start the arc to form a circle
        ctx.arc(570, 250, 100, 0, Math.PI * 2, true);
        // Put the pen down
        ctx.closePath();
        // Clip off the region you drew on
        ctx.clip();

        const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: 'jpg' }));

        ctx.drawImage(avatar, 470, 150, 200, 200);
        ctx.drawImage(background, 100, 150, 200, 200);
        ctx.drawImage(heart, 235, 150, 150, 150);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'bonk.png' });
        interaction.reply({ content: `<@${user.id}> loves Egg Borger`, files: [attachment] })
	},
};