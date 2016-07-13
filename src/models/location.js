import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const locationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  theaters: {
    type: Schema.Types.ObjectId,
    ref: 'Theater',
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
  },
});

export default mongoose.model('Location', locationSchema);
