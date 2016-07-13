import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const movieSchema = new Schema({
  key: {
    type: String,
    required: true,
  },
  OMDbRef: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Movie', movieSchema);
