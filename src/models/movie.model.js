import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export default mongoose.model('Movie', new Schema({
  key: {
    type: String,
    required: true,
  },
  OMDbRef: {
    type: String,
    required: true,
  },
}));
