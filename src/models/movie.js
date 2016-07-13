import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const movieSchema = new Schema({
  OMDbRef: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  genres: [{
    type: String,
  }],
  critic: {
    type: Number,
    min: 0,
    max: 10,
  },
  release: {
    type: Number,
    min: 1800,
  },
  director: {
    type: String,
  },
  country: {
    type: String,
  },
});

export default mongoose.model('Movie', movieSchema);
