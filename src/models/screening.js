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
  // Breaks. Will check later to confirm if these are needed for virtual properties.
  // toObject: {
  //   virtuals: true,
  // },
  // toJSON: {
  //   virtuals: true,
  // },
});

screeningSchema.statics.byCompany = function byCompany(companyId) {
  const companyPromise = this.aggregate([
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

  companyPromise.lookup({
    from: 'movies',
    localField: 'movie',
    foreignField: '_id',
    as: 'movie_data',
  });
  companyPromise.unwind('$movie_data');

  companyPromise.lookup({
    from: 'theaters',
    localField: 'theater',
    foreignField: '_id',
    as: 'theater_data',
  });
  companyPromise.unwind('$theater_data');

  companyPromise.lookup({
    from: 'locations',
    localField: 'theater_data.location',
    foreignField: '_id',
    as: 'locations_data',
  });
  companyPromise.unwind('$locations_data');

  companyPromise.match({ 'locations_data.company': mongoose.Types.ObjectId(companyId) });

  companyPromise.sort({ dateTime: -1 });

  return companyPromise.then(data => {
    return data.map(x => {
      x.dateTime = moment(x.dateTime).format('MM-DD-YYYY HH:mm');
      return x;
    });
  });
};

screeningSchema.virtual('ratioTicketsSale')
  .get(() => this.attendenceTotal / this.admissionsTotal);

screeningSchema.virtual('ratioAttendenceAdmissions')
  .get(() => this.attendenceTotal / this.seats);

screeningSchema.statics.aggData = function aggMatchingCompany(
  company,
  type,
  title,
  genre,
  directors,
  criticmin,
  criticmax,
  yearmin,
  yearmax,
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
    aggPromise.match({ 'movie_data.countries': { $in: [country] } });
  }

  if (directors) {
    aggPromise.match({ 'movie_data.directors': { $in: [directors] } });
  }

  if (title) {
    aggPromise.match({ 'movie_data.title': title });
  }

  if (genre) {
    aggPromise.match({ 'movie_data.genres': { $in: [genre] } });
  }

  if (yearmin) {
    const releaseminNum = Number(yearmin);
    aggPromise.match({ 'movie_data.year': { $gte: releaseminNum } });
  }

  if (yearmax) {
    const releasemaxNum = Number(yearmax);
    aggPromise.match({ 'movie_data.year': { $lte: releasemaxNum } });
  }

  if (criticmin) {
    const criticminNum = Number(criticmin);
    aggPromise.match({ 'movie_data.metascore': { $gte: criticminNum } });
  }

  if (criticmax) {
    const criticmaxNum = Number(criticmax);
    aggPromise.match({ 'movie_data.metascore': { $lte: criticmaxNum } });
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

screeningSchema.statics.topTenAdm = function topTenAdm() {
  const tenPromise = this.aggregate([
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
  tenPromise.lookup({
    from: 'movies',
    localField: 'movie',
    foreignField: '_id',
    as: 'movie_data',
  });
  tenPromise.unwind('$movie_data');

  // Group by month
  tenPromise.group({
    _id: '$movie',
    count: { $sum: 1 },
    admissions: { $sum: '$admissionsTotal' },
    attendance: { $sum: '$attendanceTotal' },
    avgAdm: { $avg: '$admissionsTotal' },
    avgAtt: { $avg: '$attendanceTotal' },
    title: { $first: '$movie_data.title' },
    poster: { $first: '$movie_data.OMDbdata.poster' },
  });

  // Sort based on admissions total
  tenPromise.sort({ admissions: -1 });

  // limit to top ten
  tenPromise.limit(3);

  return tenPromise;
};

const screening = mongoose.model('Screening', screeningSchema);

export default screening;
