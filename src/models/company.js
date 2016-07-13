import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export default mongoose.model('Company', new Schema({
  name: {
    type: String,
    required: true,
  },
}));
