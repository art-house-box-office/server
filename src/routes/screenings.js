import express from 'express';
import bodyParser from 'body-parser';
import Screening from '../models/screening';
const jsonParser = bodyParser.json();
const router = module.exports = express.Router();
import std404ErrMsg from '../lib/404';
import hasRole from '../lib/hasRole';

router
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
        error: err,
        code: 404,
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
          msg: 'Screening not found',
          error: err,
        });
      });
  })

// POST a screening
  .post('/', jsonParser, (req, res, next) => {
    new Screening(req.body)
      .save()
      .then(screening => {
        if (screening) res.json(screening);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          status: 'error',
          result: 'server err',
          error: err,
        });
      });
  })

// PUT (aka update/change) a Screening

  .put('/:id', jsonParser, (req, res, next) => {
    Screening
    .findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .then(updatedScreening => {
        if (updatedScreening) res.json(updatedScreening);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to modify screening',
          error: err,
        });
      });
  })

// DELETE a screening

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
          msg: 'unable to remove screening',
          error: err,
        });
      });
  });

export default router;
