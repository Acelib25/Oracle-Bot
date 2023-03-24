const mongoose = require('mongoose');
const { String, Date, Array } = mongoose.Schema.Types;

const User = mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    user_id: { type: Number, required: true, index: {unique: true} },
    claim_time: { type: Date, required: true },
    workers: { type: Array, required: true },
    items: { type: Object, required: true },
}));

module.exports = { User };