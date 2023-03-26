const mongoose = require('mongoose');
const colors = require('colors');
const config = require('../config.json');
const route = require('express').Router();
const { User } = require('../models/user.js');

route.get("/:item", async (req, res, next) => {
    const id = req.query.id;
    const item = req.params.item;
    const amount = req.query.amount;
    console.log(`[ITEMS] Request to add ${amount} ${item} to user ${id} recieved`.yellow);
    try {
        User.findOne({ 'user_id': parseInt(id) }).then(async (user) => {
            if (user) {
                console.log(`[USERS] User ${id} found in database`.green);
                const target = await User.findOne({ user_id: parseInt(id)}, 'name claim_time items workers').exec();
                if (Object.keys(target.items).includes(item)){
                    console.log("[ITEMS] Item already exists in user's inventory, adding to existing amount.".yellow)
                    let newNumber = target.items[item] + parseInt(amount);
                    if (newNumber < 0) newNumber = 0;
                    let newItem = JSON.parse(`{ "${item}": ${newNumber} }`);
                    let newArray = {}
                    Object.assign(newArray, target.items)
                    Object.assign(newArray, newItem);
                    target.items = newArray;
                    target.save();
                    res.send(`Added ${amount} more "${item}" to user's inventory.`);
                    console.log("[ITEMS] Item(s) added to user's inventory.".green)
                } else {
                    console.log("[ITEMS] Item does not exist in user's inventory, creating new item and adding amount.".yellow)
                    let newItem = JSON.parse(`{ "${item}": 0 }`);
                    if (amount < 0) return res.send("Cannot go below 0 items.");
                    Object.defineProperty(newItem, item, {
                        value: parseInt(amount),
                        writable: true
                    });
                    target.items = Object.assign(newItem, target.items);
                    target.save();
                    res.send(`Created new item "${item}", added ${amount} to user's inventory.`);
                    console.log("[ITEMS] Item(s) added to user's inventory.".green) 
                }
                
            } else {
                console.log(`[ERROR] User ${id} not found in database; unable to add ${amount} ${item}.`.red);
                res.send("User does not exist. Create this user, then try again.");
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = route;