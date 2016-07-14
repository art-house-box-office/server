import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const movieSchema = new Schema({
  OMDbRef: {
    type: String,
  },
  OMDbdata: {
    type: Schema.Types.Mixed,
  },
  title: {
    type: String,
    required: true,
  },
  genres: [{
    type: String,
  }],
  metascore: {
    type: Number,
    min: 0,
    max: 100,
  },
  released: {
    type: Date,
  },
  directors: {
    type: [String],
  },
  countries: {
    type: [String],
  },
  OMDb: {
    type: Boolean,
    required: true,
  },
});

export default mongoose.model('Movie', movieSchema);
