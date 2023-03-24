const mongoose = require('mongoose');
const { String, Date, Array, Number } = mongoose.Schema.Types;


const Sequence = mongoose.model('Sequence', new mongoose.Schema({
    worker_id: { type: Number, required: true },
}));

module.exports = Sequence;