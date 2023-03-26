const mongoose = require('mongoose');
const { String, Date, Array } = mongoose.Schema.Types;

const User = mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    user_id: { type: Number, required: true, index: {unique: true} },
    claim_time: { type: Date, required: true },
    balance: { type: Number, required: true },
    workers: { type: Array, required: true },
    items: { type: Object, required: true },
    sessionToken: { type: String, required: false, default: null, index: {unique: true} },
}));

module.exports = { User };