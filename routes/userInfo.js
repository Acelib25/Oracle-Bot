const mongoose = require('mongoose');
const colors = require('colors');
const config = require('../config.json');
const route = require('express').Router();
const { User } = require('../models/user.js');

route.get("/:id", async (req, res, next) => {
    const id = req.params.id;
    console.log(`[GET] Page for user id ${id} requested`.yellow);
    try {
        User.findOne({ 'user_id': parseInt(id) }).then(async (user) => {
            if (user) {
                console.log(`[GET] User ${id} found in database`.green);
                const target = await User.findOne({ user_id: parseInt(id)}, 'name claim_time items workers').exec();
                let object = {
                    name: target.name,
                    claim_time: target.claim_time,
                    items: target.items,
                    workers: target.workers
                };
                res.send(object);
            } else {
                console.log(`[GET] User ${id} not found in database`.red);
                try {
                    const newUser = new User({
                        name: 'test',
                        user_id: parseInt(id),
                        claim_time: Date.now(),
                        workers: [],
                        items: {
                            "wood": 1,
                            "stone": 4,
                        },
                    });
                    await newUser.save();
                    console.log(`[GET] User ${id} created in database`.green);
                    res.send(newUser.name);
                } catch (error) {
                    console.log(`[GET] Error creating user ${id} in database`.red);
                    next(error);
                    res.send("there was an error creating your user");
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = route;