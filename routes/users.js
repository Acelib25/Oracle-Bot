const mongoose = require('mongoose');
const colors = require('colors');
const config = require('../config.json');
const route = require('express').Router();
const { User } = require('../models/user.js');
const { createUser } = require('../methods/userAdd.js');
const { deleteUser } = require('../methods/userDelete.js');

route.get("/info/:id", async (req, res, next) => {
    const id = req.params.id;
    console.log(`[USERS] Page for user id ${id} requested`.yellow);
    try {
        User.findOne({ 'user_id': parseInt(id) }).then(async (user) => {
            if (user) {
                console.log(`[USERS] User ${id} found in database`.green);
                const target = await User.findOne({ user_id: parseInt(id)}, 'name claim_time items workers').exec();
                let object = {
                    name: target.name,
                    id: id,
                    claim_time: target.claim_time,
                    balance: target.balance,
                    items: target.items,
                    workers: target.workers
                };
                res.send(object);
            } else {
                console.log(`[ERROR] User ${id} not found in database, aborting`.red);
                res.send(`ERROR: A user with id ${id} was not found. Create the user, then try again.`);
            }
        });
    } catch (error) {
        next(error);
    }
});

route.get("/create/:id", async (req, res, next) => {
    const id = req.params.id;
    createUser({id: id, name: 'Discord User'});
});
                    

route.get("/delete/:id", async (req, res, next) => {
    const id = req.params.id;
    console.log(`[USERS] User deletion requested. ID: ${id}`.yellow);
    try {
        User.findOne({ 'user_id': parseInt(id) }).then(async (user) => {
            if (user) {
                console.log(`[USERS] User ${id} found in database, deleting`.yellow);
                try {
                    deleteUser({id: id});
                    console.log(`[USERS] User ${id} deleted from database`.green);
                    res.send(`User ${id} deleted.`);
                } catch (error) {
                    console.log(`[ERROR] Error deleting user ${id} from database`.red);
                    next(error);
                    res.send("There was an error deleting user " + id);
                }
            } else {
                console.log(`[ERROR] User ${id} not found in database, aborting`.red);
                res.send(`ERROR: A user with id ${id} was not found.`);
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = route;