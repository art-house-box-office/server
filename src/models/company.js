import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const companySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  locations: {
    type: [Schema.Types.ObjectId],
    ref: 'Location',
    required: true,
  },
});

export default mongoose.model('Company', companySchema);
