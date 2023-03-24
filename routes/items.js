const mongoose = require('mongoose');
const colors = require('colors');
const config = require('../config.json');
const route = require('express').Router();
const { User } = require('../models/user.js');

route.get("/item", async (req, res, next) => {
    const id = req.query.id;
    const item = req.query.item;
    const amount = req.query.amount;
    console.log(`[GET] Request to add ${amount} ${item} to user ${id} recieved`.yellow);
    try {
        User.findOne({ 'user_id': parseInt(id) }).then(async (user) => {
            if (user) {
                console.log(`[GET] User ${id} found in database`.green);
                const target = await User.findOne({ user_id: parseInt(id)}, 'name claim_time items workers').exec();
                target.items.$inc[item] = amount;
                
            } else {
                console.log(`[ERROR] User ${id} not found in database; unable to add ${amount} ${item}.`.red);
                res.send("User not found in database");
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = route;