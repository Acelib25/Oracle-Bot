const mongoose = require('mongoose');
const { String, Date, Array, Number } = mongoose.Schema.Types;


const Worker = mongoose.model('Worker', new mongoose.Schema({
    name: { type: String, required: true },
    worker_id: { type: Number, required: true, index: true, unique: true },
    level: { type: Number, required: true },
    mood: { type: String, required: true },
    deployed: { type: String, required: true },
    produced: { type: Array, required: true },
}));

// When setting up the worker, 
// we need to make sure that the worker_id is unique
// this can be dong by querying sequence
// and getting the current ID
// be sure to inc sequence after getting the ID

module.exports = Worker;