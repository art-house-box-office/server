import express from 'express';
import bodyParser from 'body-parser';
import std404ErrMsg from '../lib/404';
import hasRole from '../lib/hasRole';
import Theater from '../models/theater';

const router = express.Router(); // eslint-disable-line
const jsonParser = bodyParser.json();

router
  // Retrieve all Theaters
  .get('/', (req, res, next) => {
    Theater
      .find({})
      .lean()
      .then(theaters => {
        if (theaters) res.json(theaters);
        else next(std404ErrMsg);
      })
      .catch(err => next({
        code: 404,
        error: err,
        msg: 'No theaters found',
      }));
  })
  // Retrieve a specific Theater
  .get('/:theaterId', (req, res, next) => {
    Theater
      .findById(req.params.theaterId)
      .lean()
      .then(theater => {
        if (theater) res.json(theater);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 404,
          error: err,
          msg: 'Theater not found',
        });
      });
  })
  // Retrieve All Rooms By Location
  .get('/bylocation/:locationId', (req, res, next) => {
    Theater
      .find({ location: req.params.locationId })
      .lean()
      .then(theaters => {
        if (theaters) res.json(theaters);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 404,
          error: err,
          msg: 'Theaters not found',
        });
      });
  })
  // Create a Theater
  .post('/', jsonParser, (req, res, next) => {
    new Theater(req.body)
      .save()
      .then(theater => res.json(theater))
      .catch(err => {
        next({
          code: 500,
          result: 'Unable to create theater',
          error: err,
        });
      });
  })
  // Update/change a specific Theater
  .put('/:id', jsonParser, (req, res, next) => {
    Theater
      .findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
      .then(updatedTheater => {
        if (updatedTheater) res.json(updatedTheater);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Unable to modify theater',
        });
      });
  })
  // Remove a Theater
  .delete('/:id', hasRole('admin'), (req, res, next) => {
    Theater
      .findByIdAndRemove(req.params.id)
      .then(removedTheater => {
        if (removedTheater) res.json(removedTheater);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Unable to remove theater',
        });
      });
  });

export default router;
