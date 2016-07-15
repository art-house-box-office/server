import express from 'express';
import bodyParser from 'body-parser';
import std404ErrMsg from '../lib/404';
import hasRole from '../lib/hasRole';
import Screening from '../models/screening';

const router = express.Router(); // eslint-disable-line
const jsonParser = bodyParser.json();

router
// Get screenings by company
  .get('/bycompany/:id', (req, res, next) => {
    const companyId = req.params.id;
    Screening.byCompany(companyId)
      .then(r => res.json(r))
      .catch(err => next({
        code: 404,
        msg: 'Data not found',
        error: err,
      }));
  })
// GET aggregate results
  .get('/agg', (req, res, next) => {
    const {
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
      timemax,
    } = req.query;
    Screening.aggData(
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
      timemax)
    .then(data => res.json(data))
    .catch(err => next({
      code: 404,
      msg: 'Data not found',
      error: err,
    }));
  })
  // Retrieve Top Ten Grossing movies
  .get('/topadm', (req, res, next) => {
    Screening.topTenAdm()
    .then(data => res.json(data))
    .catch(err => next({
      code: 404,
      msg: 'Data not found',
      error: err,
    }));
  })
  // Retrieve all Screenings
  .get('/', (req, res, next) => {
    Screening
      .find({})
      .lean()
      .then(screenings => {
        if (screenings) res.json(screenings);
        else next(std404ErrMsg);
      })
      .catch(err => next({
        code: 404,
        error: err,
        msg: 'No screenings found',
      }));
  })
  // Retrieve a specific Screening
  .get('/:screeningId', (req, res, next) => {
    Screening
      .findById(req.params.screeningId)
      .lean()
      .then(screening => {
        if (screening) res.json(screening);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 404,
          error: err,
          msg: 'Screening not found',
        });
      });
  })
  // Create a Screening
  .post('/', jsonParser, (req, res, next) => {
    new Screening(req.body)
      .save()
      .then(screening => {
        if (screening) res.json(screening);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          result: 'Unable to create screening',
        });
      });
  })
  // Update/change a specific Screening
  .put('/:id', jsonParser, (req, res, next) => {
    Screening
      .findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
      .then(updatedScreening => {
        if (updatedScreening) res.json(updatedScreening);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Unable to modify screening',
        });
      });
  })
  // Remove a Screening
  .delete('/:id', hasRole('admin'), (req, res, next) => {
    Screening
      .findByIdAndRemove(req.params.id)
      .then(removedScreening => {
        if (removedScreening) res.json(removedScreening);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Unable to remove screening',
        });
      });
  });

export default router;
