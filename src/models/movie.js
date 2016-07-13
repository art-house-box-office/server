import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const movieSchema = new Schema({
  OMDbRef: {
    type: String,
    required: true,
  },
  OMDbdata: {
    type: Schema.types.mixed,
  },
  title: {
    type: String,
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
  }
});

export default mongoose.model('Movie', movieSchema);
