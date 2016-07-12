import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export default mongoose.model('Company', new Schema({
  name: {
    type: String,
    required: true,
  },
  users: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  locations: {
    type: [Schema.Types.ObjectId],
    ref: 'Location',
  },
}));
