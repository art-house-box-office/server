import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const screeningSchema = new Schema({
  movie: {
    type: Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  theater: {
    type: Schema.Types.ObjectId,
    ref: 'Theater',
    required: true,
  },
  attendanceTotal: {
    type: Number,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
  },
  admissionsTotal: {
    type: Number,
    required: true,
  },
  concessionsTotal: {
    type: Number,
  },
  format: {
    type: String,
  },
  seats: {
    type: Number,
    required: true,
  },
  // Breaks.  Will check later to confirm if these are needed for virtual properties.
  // toObject: {
  //   virtuals: true,
  // },
  // toJSON: {
  //   virtuals: true,
  // },
});

screeningSchema.virtual('ratioTicketsSale')
  .get(() => this.attendenceTotal / this.admissionsTotal);

screeningSchema.virtual('ratioAttendenceAdmissions')
  .get(() => this.attendenceTotal / this.seats);

const screening = mongoose.model('Screening', screeningSchema);

export default screening;
