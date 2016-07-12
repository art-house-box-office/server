import express from 'express';
import bodyParser from 'body-parser';
import Location from '../models/location';
const jsonParser = bodyParser.json();
import std404ErrMsg from '../lib/404';
import hasRole from '../lib/hasRole';

const router = express.Router();

router
  .get('/', (req, res, next) => {
    Location.find()
      .then(locations => {
        if (locations) res.json(locations);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to retrieve location list',
          error: err,
        });
      });
  })
  .get('/:id', (req, res, next) => {
    Location.findById(req.params.id)
      .then(location => {
        if (location) res.json(location);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to retrieve specified location',
          error: err,
        });
      });
  })
  .post('/', jsonParser, (req, res, next) => {
    new Location(req.body)
      .save()
      .then(posted => {
        if (posted) res.json(posted);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to create location',
          error: err,
        });
      });
  })
  .put('/:id', jsonParser, (req, res, next) => {
    Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .then(updatedLocation => {
        if (updatedLocation) res.json(updatedLocation);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to modify location',
          error: err,
        });
      });
  })
  .delete('/:id', hasRole('admin'), (req, res, next) => {
    Location.findByIdAndRemove(req.params.id)
      .then(removedLocation => {
        if (removedLocation) res.json(removedLocation);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to remove location',
          error: err,
        });
      });
  });

export default router;
