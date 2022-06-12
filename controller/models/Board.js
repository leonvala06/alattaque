const mongoose = require('mongoose');

const boardSchema = mongoose.Schema({
    squares: { type: Array, required: true },
    turn: { type: Number, required: true },
    attribute: { type: String },
    issue: { type: String }
  });

module.exports = mongoose.model('Board', boardSchema);
  