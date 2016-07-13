import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const theaterSchema = new Schema({
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
    ref: 'Location',
  },
});

export default mongoose.model('Theater', theaterSchema);
