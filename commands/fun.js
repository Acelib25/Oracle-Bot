/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, AttachmentBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { Discord } = require('discord.js');
const axios = require('axios');
const fs = require('node:fs');
const path = require('node:path');
const wait = require('node:timers/promises').setTimeout;
const { Users, CurrencyShop } = require('../dbObjects.js');
const { Op } = require('sequelize');
const packageInfo = require('../package.json');
let wack_id = [];
let wack_bonks = [];
let blacklist = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fun')
		.setDescription('Fun commands!')
        .addSubcommand(sub => 
			sub
			.setName('bonk')
            .setDescription('Bonk a hoe')
            .addUserOption(option => option.setName('target').setDescription('Who is horny?').setRequired(true))
            .addStringOption(option => option.setName('reason').setDescription('Why they horny?'))
            .addBooleanOption(option => option.setName('ping').setDescription('Want to ping them?')),
		)
        .addSubcommand(sub => 
            sub
            .setName('bigthink')
		    .setDescription('HMMMMMMMMMMMM')
        )
        .addSubcommand(sub => 
            sub
            .setName('borgur')
            .setDescription('Yummi')
            .addUserOption(option => option.setName('target').setDescription('Who needs a borgur?').setRequired(true))
        )
        .addSubcommand(sub => 
            sub
            .setName('count')
            .setDescription('Counts to number!')
            .addIntegerOption(option => option.setName('target').setDescription('How high?').setMaxValue(100)),
        ).addSubcommand(sub => 
            sub
            .setName('eightball')
            .setDescription('See what fate says')
            .addStringOption(option => option.setName('question').setDescription('What shall ye ask?')),
        ).addSubcommand(sub => 
            sub
            .setName('info')
		    .setDescription('Oracle Information')
        ).addSubcommand(sub => 
            sub
            .setName('salt')
		    .setDescription('I shall insult someone.')
		    .addUserOption(option => option.setName('target').setDescription('Who is bad?')),
        ).addSubcommand(sub => 
            sub
            .setName('number')
		    .setDescription('The Numbers The Numbers The Numbers')
        ).addSubcommand(sub => 
            sub
            .setName('say')
            .setDescription('Oracle Says')
            .addStringOption(option => option.setName('message').setDescription('You what me to say what?'))
            .addAttachmentOption(option => option.setName('image').setDescription('You what me to show what?')),
        ).addSubcommand(sub => 
            sub
            .setName('inspire')
            .setDescription('Oracle Inspires!'),
        ),
	async execute(interaction, currency) {
		
        
        if (interaction.options.getSubcommand() === 'bonk') {
            let image = "https://i.imgur.com/QFcD0kw.png"
            const canvas = Canvas.createCanvas(720, 492);
            const ctx = canvas.getContext('2d');
            let user = interaction.options.getUser('target');
            let reason = interaction.options.getString('reason');
            let pingpong = interaction.options.getBoolean('ping');

            interaction.reply("Loading");

            const background = await Canvas.loadImage(image)
            .catch(error => {
            writelog(error);
            interaction.editReply("Oops `Error: 403`, tell Ace to fix this. Try again.");
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
                interaction.editReply({ content: `<@${user.id}> has been bonked because ${reason}!!!!`, files: [attachment], components: [row] })
            } 
            else if (reason && !pingpong){
                interaction.editReply({ content: `${user.username} has been bonked because ${reason}!!!!`, files: [attachment], components: [row] })
            } 
            else if (pingpong){
                interaction.editReply({ content: `<@${user.id}> has been bonked!!!!`, files: [attachment], components: [row] })
            } 
            else {
                interaction.editReply({ content: `${user.username} has been bonked!!!!`, files: [attachment], components: [row] })
            }

            await wait(1000)
            return { message: await interaction.fetchReply(), args: { target: user, reason: reason, ping: pingpong } }
        }

        else if (interaction.options.getSubcommand() === 'bigthink'){
            
            function choose(choices) {
                var index = Math.floor(Math.random() * choices.length);
                return choices[index];
            }
            
            let name = interaction.member.user.username;

            if (interaction.member.nickname){
                name = interaction.member.nickname;
            }

            msgOptions = [
                "I have decided that your mother is a utter ||delight||.",
                "After some thought I have decided that you are lame.",
                "I have asked the Entropy to reveal your future, I regret to say you have none.",
                "The Entropy has told me you are pretty cool. :sunglasses:",
                "May your crops wither and your animals become diseased.",
                "My ponderings has concluded, you are a hoe.",
                "May both sides of your pillow be hot.",
                `${name}: \\**Donates their body to science*\\*\n\nScience: \**Donates the body to Goodwill*\*`,
                "I hope your body gets donated to science",
                "+10"
            ]

            let decision = choose(msgOptions)

            if (decision == '+10'){
                decision = 'I see great fortune in your future! (+10 ⵇ)'
                currency.add(interaction.member.user.id, 10)
            }
            
            await interaction.deferReply();
            await wait(5000);
            await interaction.editReply(decision);
            return { message: await interaction.fetchReply(), args: { none: "none" } }
        }


        else if (interaction.options.getSubcommand() === 'borgur') {
            interaction.reply("Loading");
            let image = "https://cdn.discordapp.com/attachments/1000617928938508368/1014589364824719472/unknown-237.png"
            const canvas = Canvas.createCanvas(720, 500);
            const ctx = canvas.getContext('2d');
            const user = interaction.options.getUser('target');
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
            interaction.editReply({ content: `<@${user.id}> loves Egg Borger`, files: [attachment] })
            return { message: await interaction.fetchReply(), args: { target: user} }
        }

        

        else if (interaction.options.getSubcommand() === 'count') {
            
            const num = interaction.options.getInteger('target')

            if (num > 100){
                num = 100;
            }

            await interaction.reply(`Ok I will count to ${num}`)
            await wait(2000);
            for (let i = 1; i <= num; i++){
                interaction.editReply(`${i}`)
                await wait(1000);
            }
            interaction.editReply(`Done! ${num}`)
            return { message: await interaction.fetchReply(), args: { target_number: num } }
        }

        
        else if (interaction.options.getSubcommand() === 'eightball') {
            let name = interaction.member.user.username;

            if (interaction.member.nickname){
                name = interaction.member.nickname;
            }

            let question = `${name} asks: "${interaction.options.getString('question')}"`;
            
            function choose(choices) {
                var index = Math.floor(Math.random() * choices.length);
                return choices[index];
            }

            msgOptions = [
                "It is certain.",
                "It is decidedly so.",
                "Without a doubt.",
                "Yes definitely.",
                "You may rely on it.",
                "As I see it, yes.",
                "Most likely.",
                "Outlook good.",
                "Yes.",
                "Signs point to yes.",
                "Reply hazy, try again.",
                "Ask again later.",
                "Better not tell you now.",
                "Cannot predict now.",
                "Concentrate and ask again.",
                "Don't count on it.",
                "My reply is no.",
                "My sources say no.",
                "Outlook not so good.",
                "Very doubtful.",
                "Pasta."
            ]
            
            let decision = choose(msgOptions)
            
            if (!question){
                question = "*secret*"
            }

            await interaction.reply(`${question}.\n8-Ball: *Thinking...*`);
            await wait(5000);
            await interaction.editReply(`${question}.\n8-Ball: ${decision}`);
            return { message: await interaction.fetchReply(), args: { none: "none" } }
        }


        else if (interaction.options.getSubcommand() === 'info') {
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
            return { message: "[Embed]", args: { none: "none" } }
        }

        
        else if (interaction.options.getSubcommand() === 'salt') {
            const taggedUser = interaction.options.getUser('target');

            function choose(choices) {
                var index = Math.floor(Math.random() * choices.length);
                return choices[index];
            }

            let adj = [
                "stupid", 
                "disgusting", 
                "putrid", 
                "lucid", 
                "haggard", 
                "dense", 
                "sub-par", 
                "terrible", 
                "lazy", 
                "idiot", 
                "profain", 
                "aggressive", 
                "desperate",
                "saggy",
                'butt munching',
                'discount',
                'Kroger brand',
                'bargain bin',
                'yellow',
                'green',
                'pallid',
                'ghastly',
                'maidenless',
                'goldfish brained',
                'tit witted',
                'dog breathed',
                'protein lacking',
                'vertically challenged',
                'soot eating',
                'toaster licking',
                'fucking',
                'shit eating',
                'half brained',
                'half baked',
                'pint sized',
                'whorebagging',
                'grandma-shoving',
                'taxidermy tasting',
                'cat kicking',
                'ball busting ',
                'fictitious',
                
            ]

            let curse = [
                "poo", 
                "fuck", 
                "shit", 
                "crap", 
                "bitch", 
                "ass", 
                "sack", 
                "idiotic", 
                "ice", 
                "piss", 
                "bloated", 
                "turd",
                "cunt",
                "toe-sucking",
                "dip-ass",
                'dipshit',
                'dryshite',
                'gobshite',
                'lardass',
                'soot eating',
                'gay',
                'mismatched',
                'simple',
                'lackluster',
                'lying',
                'lippy',
                'crab infested',
                'spider infested ',
                'vacant',
                'rickrolled',
                'short nosed ',
                'crusty',
                'shifty eyed',
                'talentless',
                'fatherless',
                'loveless',
                'loathsome',
                'spawn camping',
                'playdough brained',
                'scandalous',
                'piss soaked',

            
            ]

            let noun = [
                "nugget", 
                "ball", 
                "pole", 
                "wall", 
                "llama", 
                "dog", 
                "cat", 
                "donkey", 
                "cup", 
                "brain", 
                "mouse", 
                "butt", 
                "idiot",
                "hat", 
                "head", 
                "pile", 
                "crack",
                'goblin',
                'consumer',
                'eater',
                'enjoyer',
                'simp',
                'finch fiddler',
                'dipshit',
                'ass-munch',
                'pygmy',
                'pile of used goods',
                'dumpster fire',
                'langer',
                'lickarse',
                'gombeen',
                'has-been, or should I say never-was',
                'sard',
                'lardo',
                'peen',
                'weeny',
                'crybaby bitch boi',
                'wankler',
                'wrinkle',
                'frisbee',
                'clown :clown:',
                'ring dingler',
                'kraft single',
                'lone fuck',
                'fuckler',
                'fuck nugget',
                'bitch brisket',
                'limp noodle',
                'foot lettuce',
                'flat fuck',
                'asshat',
                'dingle donkey',
                'dingle berry',
                'foot enthusiast',
                'wang dangler',
                'truck fucker',
                'milk drinker',
                'paint watcher ',
                'finger-er',
                'simpleton',
                'pimpledick',
                'imp',
                'whorebagger',
                'uncle fucker',
                'nit',
                'angler',
                'cornhole',
                'fictitious spider monkey',
                'factless baseball card',
                'green brick (Ask Ace)',
                'lightless lamp coil',
                'short stop',
                '90\'s reject',
                'voldemort',
                'deflated Beach ball',
                'wannabe dildo',
                'bulldozer',
                'pond scum',
                'spaz',
                'wrench',
                'used condom',
                'great honking fat lump',
                


            ]

            let finisher = [
                ' with dogshit ergonomics',
                ' with no life',
                ' that simps for e-girls',
                ' with no bitches',
                ' who even the grinch would find disgusting',
                ' with the guinness world record for ugliest person, if you could even be called human',
                ' who gets off sucking toes',
                ' who will forever be maidenless',
                ', honka honka :clown:',
                ', may you get no bitches',
                '. I hope both sides of your pillow are warm >:) ',
                '. I hope you step on a pile of legos >:) ',
                '. Someone call the tard wranglers cause this retard missed the short bus',
                '. Someone call a number 15 cause this guy is the new foot lettuce',
                ' with zero chance to get laid',
                ' who will die alone, and be buried as such',
                ' just making this insult for you was a waste of my time, and I spend most of my day doing nothing',
                ', just ask your mother when she gets come from the corner of whore and main',
                ', just ask your father, oh wait, he is still getting milk',
                ', I would compare you to a pile of green bricks, ugly, and useless',
                '. If I had hands I would rip your spine out your mouth',
                '. You look like you can suck a golf ball through a garden hose',
                '. Damn, God sneezed when he made you',
                '. Looks like you could suck the chrome off a trailer hitch',
                '. If being a loser was a competition you\'d come in second. Cause your a loser',
                ' and by the way, those female hormones won\'t cure male pattern baldness',
                '. What is your major malfunction, numb-nuts',
                '. Ding dong bitch the chicken in here',
                ', ding ding ding, retard alert, retard alert',
            ]

            let out;
            if(!taggedUser){
                out = (`<@${interaction.member.user.id}> you are a ${choose(adj)} ${choose(curse)} ${choose(noun)}${choose(finisher)}!`)

            } else {
                out = (`${taggedUser} you are a ${choose(adj)} ${choose(curse)} ${choose(noun)}${choose(finisher)}!`)
    
            }
            
            
            await interaction.deferReply();
            await wait(2000);
            await interaction.editReply(out);
            return { message: await interaction.fetchReply(), args: { target: taggedUser } }
        }

        
        else if (interaction.options.getSubcommand() === 'number') {
            function getRandom(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            const msg = await interaction.reply(`Check out <#970828540968849529> Number: ${getRandom(0,77)}`);
            return { message: await interaction.fetchReply(), args: { none: "none" } }
        }

        
        else if (interaction.options.getSubcommand() === 'say') {
            const message = interaction.options.getString('message');
            const img = interaction.options.getAttachment('image');

            await interaction.reply({content: "Ok, I'll say that", ephemeral: true });
            if(img){
                await interaction.channel.send({ content: message, files: [img]})
            } else {
                await interaction.channel.send({ content: message})
            }
            return { message: await interaction.fetchReply(), args: { message: message, file: img } }
        }
      
        
        else if (interaction.options.getSubcommand() === 'inspire') {
            function choose(choices) {
                var index = Math.floor(Math.random() * choices.length);
                return choices[index];
            }
            
            const quotes = [];
            const quotesPath = path.join(__dirname, '.quotes');
            const quotesFiles = fs.readdirSync(quotesPath).filter(file => file);


            for (const file of quotesFiles) {
                const filePath = path.join(quotesPath, file);
                quotes.push(filePath);
            }

            const dec = choose(quotes);

            const attachment = new AttachmentBuilder( dec );

            await interaction.reply({files: [attachment] });
            return { message: await interaction.fetchReply(), args: { quote: dec } }
        }
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
};