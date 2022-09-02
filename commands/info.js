/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('discord.js');
const packageInfo = require('../package.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Oracle Information'),
	async execute(interaction, currency) {
		const infoEmbed = {
            color: 0x2c806a,
            title: `Bot Website`,
            url: "https://theaceprogramer.wixsite.com/acejs",
            image: {
				url: interaction.client.user.displayAvatarURL({ dynamic: true, size: 256 * 2}),
			},
            fields: [
                { name: 'Bot Name', value: `${interaction.client.user.username}`, inline: true},
                { name: 'Creator', value: "Acelib25#2173", inline: true},
                { name: 'Version', value: `${packageInfo.version}`, inline: true},
                { name: 'Version Name', value: `${packageInfo.versionName}`, inline: true},
				{ name: 'DJS Version', value: "v14 (Latest)", inline: true},
                { name: 'Description', value: `${packageInfo.description}`},
				{ name: 'Guild', value:  `${interaction.guild.name}(${interaction.guild.id})`},
				{ name: 'Channel', value:  `${interaction.channel.name}(${interaction.channel.id})`},

			],
            timestamp: new Date().toISOString(),
		}
		interaction.reply({ embeds: [infoEmbed] })
		return { message: "[Embed]" }
	},
	async args(interaction) {
		return { none: "None" }
	},
};