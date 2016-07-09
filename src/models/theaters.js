const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose.model('Theaters', new Schema({
  name: {
    type: String,
    required: true,
  },
  seats: {
    type: Number,
    required: true,
  },
  locations: {
    type: Schema.Types.ObjectId,
    ref: 'Locations',
  },
}));
