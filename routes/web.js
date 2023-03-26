/*  
    oauthData: {
        access_token: '...',
        token_type: 'Bearer',
        expires_in: 604800,
        refresh_token: '...',
        scope: 'identify'
    }
    
    userData: {
        id: '...',
        username: '...',
        global_name: '...',
        display_name: '...',
        avatar: '...',
        avatar_decoration: '...',
        discriminator: '...',
        public_flags: 0,
        flags: 0,
        banner: '...',
        banner_color: '...',
        accent_color: '...',
        locale: '...',
        mfa_enabled: false,
        premium_type: 0,
    }
*/

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('express').Router();
const { request } = require('undici');
const colors = require('colors');
const path = require('node:path');
const config = require('../config.json');
const { User } = require('../models/user.js');
const { Worker } = require('../models/worker.js');

router.use(cookieParser());

router.get('/', async (req, res) => {
    res.redirect('/home');
});

router.get('/home', async (req, res) => {
    console.log('[DASHB] Home page requested.'.yellow);
    const sessionToken = req.cookies.session_token;
    // console.log(sessionToken);
  
    if (!sessionToken) {
        res.redirect('/authenticate');
        return;
    }
  
    try {
        const decodedToken = jwt.verify(sessionToken, config.jwt.secret);
        // console.log("decodedToken: " + JSON.stringify(decodedToken));
        const user = await User.findOne({ sessionToken });
        //console.log(user);
  
        if (!user) {
            res.redirect('/authenticate');
            return;
        }
  
        const userResult = await request('https://discord.com/api/users/@me', {
            headers: {
                authorization: `Bearer ${decodedToken.access_token}`,
            },
        });
        const discordUserData = await userResult.body.json();
        
        await User.findOne({ user_id: discordUserData.id}).then(async (user) => {
            if (!user) {
                console.log('[DASHB] User not found in database.'.yellow);
            } else {
                const fullUserData = {
                    ...discordUserData,
                    avatarURL: `https://cdn.discordapp.com/avatars/${discordUserData.id}/${discordUserData.avatar}.png`,
                    bannerURL: `https://cdn.discordapp.com/banners/${discordUserData.id}/${discordUserData.banner}.png`,
                    ...user.toObject(),
                    ...decodedToken,
                };
                console.log('[DASHB] User found in database.'.yellow);
                res.render(path.join(__dirname, '../pugfiles/dashboard.pug'), fullUserData);
                console.log('[DASHB] Dashboard page rendered for '.yellow + `${discordUserData.username}#${discordUserData.discriminator}`.blue);
            }
        });
    } catch (error) {
        console.error(error);
        res.redirect('/authenticate');
    }
});
  

router.get('/authenticate', async (req, res, next) => {
    console.log('[DAUTH] Discord auth page requested.'.yellow);
    if (!req.query.code) {
        try{
            res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${config.discord.clientID}&redirect_uri=http://localhost:${config.port}/authenticate&response_type=code&scope=identify`);
        } catch (error) {
            console.error(error);
        }
    } else if (req.query.code) {
        let code = req.query.code;
        console.log(`[DAUTH] Code: ${code}`.yellow);
        console.log('[DAUTH] Discord auth token requested.'.yellow);
        try {
            const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: config.discord.clientID,
                    client_secret: config.discord.clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: `http://localhost:${config.port}/authenticate`,
                    scope: 'identify',
                }).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const oauthData = await tokenResponseData.body.json();
            if (oauthData.error){
                res.redirect('/authenticate');
                return;
            }
            const userResult = await request('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${oauthData.token_type} ${oauthData.access_token}`,
                },
            });
            const userData = await userResult.body.json();
            // console.log("userData", JSON.stringify(userData))
            if (userData.code){
                res.redirect('/authenticate');
                return;
            } else {
                const sessionToken = jwt.sign({ access_token: oauthData.access_token }, config.jwt.secret, { expiresIn: '1h' });
                await User.findOne({ user_id: userData.id }).then((user) => {
                    if (user) {
                        console.log('[USERS] User already exists in database'.green);
                        user.sessionToken = sessionToken;
                        user.save();
                    } else {
                        console.log('[USERS] User does not exist in database, attempting to create'.yellow);
                        try{
                            console.log('[WRKRS] Creating first worker for new user');
                            const firstWorker = new Worker({
                                name: 'Beggar',
                                price: 50,
                                level: 1,
                                mood: "happy",
                                deployed: true,
                                arrested: false,
                                produced: [
                                    "Entropy",
                                ],
                            });
                            firstWorker.save();
                            console.log('[WRKRS] First worker created successfully');
                            Worker.findOne({_id: firstWorker._id}).then((worker) => {
                                console.log('[WRKRS] Worker found in database'.green);
                                console.log('[WRKRS] Worker: '.green + JSON.stringify(worker));
                            });
                            console.log('[USERS] Creating new user, with worker in the workers array');
                            const newUser = new User({
                                name: userData.username + '#' + userData.discriminator,
                                user_id: userData.id,
                                claim_time: Date.now(),
                                balance: 500,
                                workers: [
                                    firstWorker._id,
                                ],
                                items: {
                                    "Welcome Balloon": 1,
                                },
                                sessionToken: sessionToken,
                            });
                            newUser.save();
                            console.log('[USERS] User created successfully'.green);
                        } catch (error) {
                            console.log("[ERROR] Error saving user to database".red);
                            console.error(error);
                        }
                    }
                });
                console.log(`[DAUTH] User ${userData.username}#${userData.discriminator} (${userData.id}) authenticated`.green);
                res.cookie('session_token', sessionToken, { maxAge: 3600000, httpOnly: true });
                res.redirect('/home');
            }
        } catch (error) {
            // NOTE: An unauthorized token will not throw an error
            // tokenResponseData.statusCode will be 401
            console.error(error);
        }
    }
});

module.exports = router;