const mongoose = require('mongoose');
const colors = require('colors');
const config = require('../config.json');

async function connectDB(){
    try {
        const conn = await mongoose.connect(config.database.dbToConnect);
        console.log(`[DTBSE] MongoDB connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`.magenta)
    } catch (error) {
        console.log(`error: ${error}`);
        process.exit(1);
    }
}

module.exports = { connectDB };