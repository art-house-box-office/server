import express from 'express';
import bodyParser from 'body-parser';
import Screening from '../models/screening';
import moment from 'moment';

const router = express.Router(); // eslint-disable-line
const jsonParser = bodyParser.json();

router
  .post('/', jsonParser, (req, res, next) => {
    const run = req.body;
    const start = moment(run.startDate);
    const end = moment(run.endDate);
    const data = [];
    for (let date = start; date.isSameOrBefore(end); date.add(1, 'days')) {
      run.times.forEach(time => {
        const newScreening = {};
        newScreening.movie = run.movieId;
        newScreening.theater = run.theaterId;
        newScreening.seats = run.seats;
        const timeHour = time.split(':')[0];
        const timeMin = time.split(':')[1];
        const showTime = new moment(date);
        newScreening.dateTime = showTime
          .add(timeHour, 'hours')
          .add(timeMin, 'minutes')
          .format('');
        data.push(new Screening(newScreening).save());
      });
    }
    // return an array of screeningIds
    Promise.all(data)
      .then(r => res.json(r))
      .catch(err => {
        next({
          code: 500,
          error: err,
          result: 'Unable to create screenings',
        });
      });
  });

export default router;
