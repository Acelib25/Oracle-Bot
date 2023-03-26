const mongoose = require('mongoose');
const { String, Date, Array, Number, Boolean, ObjectId } = mongoose.Schema.Types;


const Worker = mongoose.model('Worker', new mongoose.Schema({
    worker_id: { type: ObjectId, required: true, index: {unique: true} },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    level: { type: Number, required: true },
    mood: { type: String, required: true },
    deployed: { type: Boolean, required: true },
    arrested: { type: Boolean, required: true },
    produced: { type: Array, required: true },
}));

// When setting up the worker, 
// we need to make sure that the worker_id is unique
// this can be dong by querying sequence
// and getting the current ID
// be sure to inc sequence after getting the ID

module.exports = { Worker };