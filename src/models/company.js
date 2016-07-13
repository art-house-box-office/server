import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const companySchema = new Schema({
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
});

export default mongoose.model('Company', companySchema);
