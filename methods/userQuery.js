const { User } = require('../models/user.js');
async function getUser(user = {id: Number}){
    