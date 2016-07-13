import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import moment from 'moment';

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
  },
  dateTime: {
    type: Date,
    required: true,
  },
  admissionsTotal: {
    type: Number,
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

screeningSchema.statics.aggData = function aggMatchingCompany(
  company,
  type,
  title,
  genre,
  director,
  criticmin,
  criticmax,
  releasemin,
  releasemax,
  country,
  location,
  datemin,
  datemax,
  day,
  timemin,
  timemax) {
  const aggPromise = this.aggregate([
    {
      $project:
      {
        movie: true,
        theater: true,
        attendanceTotal: true,
        admissionsTotal: true,
        concessionsTotal: true,
        dateTime: { $subtract: ['$dateTime', 1000 * 60 * 60 * 7] },
        seats: true,
        format: true,
        dayOfWeek: { $dayOfWeek: { $subtract: ['$dateTime', 1000 * 60 * 60 * 7] } },
        hourOfDay: { $hour: { $subtract: ['$dateTime', 1000 * 60 * 60 * 7] } },
        month: { $month: '$dateTime' },
      },
    },
  ]);
  aggPromise.lookup({
    from: 'movies',
    localField: 'movie',
    foreignField: '_id',
    as: 'movie_data',
  });
  aggPromise.unwind('$movie_data');
  aggPromise.lookup({
    from: 'theaters',
    localField: 'theater',
    foreignField: '_id',
    as: 'theater_data',
  });
  aggPromise.unwind('$theater_data');
  aggPromise.lookup({ from: 'locations',
    localField: 'theater_data.location',
    foreignField: '_id',
    as: 'locations_data',
  });
  aggPromise.unwind('$locations_data');

  // Filters
  if (company) {
    if (type === 'my') {
      aggPromise.match({ 'locations_data.company': mongoose.Types.ObjectId(company) });
    } else if (type === 'other') {
      aggPromise.match({ 'locations_data.company': { $ne: mongoose.Types.ObjectId(company) } });
    }
  }

  if (country) {
    aggPromise.match({ 'movie_data.country': country });
  }

  if (director) {
    aggPromise.match({ 'movie_data.director': director });
  }

  if (title) {
    aggPromise.match({ 'movie_data.title': title });
  }

  if (genre) {
    aggPromise.match({ 'movie_data.genres': { $in: [genre] } });
  }

  if (releasemin) {
    const releaseminNum = Number(releasemin);
    aggPromise.match({ 'movie_data.release': { $gte: releaseminNum } });
  }

  if (releasemax) {
    const releasemaxNum = Number(releasemax);
    aggPromise.match({ 'movie_data.release': { $lte: releasemaxNum } });
  }

  if (criticmin) {
    const criticminNum = Number(criticmin) / 10;
    aggPromise.match({ 'movie_data.critic': { $gte: criticminNum } });
  }

  if (criticmax) {
    const criticmaxNum = Number(criticmax) / 10;
    aggPromise.match({ 'movie_data.critic': { $lte: criticmaxNum } });
  }

  if (location) {
    aggPromise.match({ 'locations_data.state': location });
  }

  if (datemin) {
    const start = moment.utc(datemin).toDate();
    aggPromise.match({ dateTime: { $gte: start } });
  }

  if (datemax) {
    const end = moment.utc(datemax).toDate();
    aggPromise.match({ dateTime: { $lte: end } });
  }

  if (day) {
    const dayNum = Number(day);
    aggPromise.match({ dayOfWeek: dayNum });
  }

  if (timemin) {
    const timeminNum = Number(timemin);
    aggPromise.match({ hourOfDay: { $gte: timeminNum } });
  }

  if (timemax) {
    const timemaxNum = Number(timemax);
    aggPromise.match({ hourOfDay: { $lte: timemaxNum } });
  }

  // Group by month
  aggPromise.group({
    _id: '$month',
    count: { $sum: 1 },
    admissions: { $sum: '$admissionsTotal' },
    attendance: { $sum: '$attendanceTotal' },
    avgAdm: { $avg: '$admissionsTotal' },
    avgAtt: { $avg: '$attendanceTotal' },
  });

  // Add summary totals
  return aggPromise.then(data => {
    const totals = data.reduce((previous, current) => {
      previous.admissions += current.admissions;
      previous.attendance += current.attendance;
      previous.count += current.count;
      return previous;
    }, { admissions: 0, attendance: 0, count: 0 });
    totals.avgAdm = totals.admissions / data.length;
    totals.avgAtt = totals.attendance / data.length;

    // Polyfill any missing months
    for (let i = 1; i < 8; i++) {
      const index = data.findIndex((e) => e._id === i);
      if (index === -1) {
        data.push({
          _id: i,
          count: 0,
          admissions: 0,
          attendance: 0,
          avgAdm: 0,
          avgAtt: 0,
        });
      }
    }

    // Sort in ascending order
    data.sort((a, b) => a._id > b._id);

    return {
      sequence: data,
      totals,
    };
  });
};

const screening = mongoose.model('Screening', screeningSchema);

export default screening;
