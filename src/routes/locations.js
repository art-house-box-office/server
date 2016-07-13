import express from 'express';
import bodyParser from 'body-parser';
import std404ErrMsg from '../lib/404';
import hasRole from '../lib/hasRole';
import Location from '../models/location';

const router = express.Router(); // eslint-disable-line
const jsonParser = bodyParser.json();

router
  // Retrieve all Locations
  .get('/', (req, res, next) => {
    Location
      .find()
      .then(locations => {
        if (locations) res.json(locations);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'No locations found',
        });
      });
  })
  // Retrieve a specific Locations
  .get('/:id', (req, res, next) => {
    Location
      .findById(req.params.id)
      .then(location => {
        if (location) res.json(location);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Location not found',
        });
      });
  })
  // Create a Location
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
          error: err,
          msg: 'Unable to create location',
        });
      });
  })
  // Update/change a specific Location
  .put('/:id', jsonParser, (req, res, next) => {
    Location
      .findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
      .then(updatedLocation => {
        if (updatedLocation) res.json(updatedLocation);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Unable to modify location',
        });
      });
  })
  // Remove a Location
  .delete('/:id', hasRole('admin'), (req, res, next) => {
    Location
      .findByIdAndRemove(req.params.id)
      .then(removedLocation => {
        if (removedLocation) res.json(removedLocation);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Unable to remove location',
        });
      });
  });

export default router;
