import express from 'express';
import bodyParser from 'body-parser';
import Location from '../models/location';
const jsonParser = bodyParser.json();

const router = express.Router();

router
  .get('/', (req, res, next) => {
    Location.find()
      .then(list => {
        if (list.length > 0) res.json({ result: list });
        else res.status(400).json({ result: 'no locations posted yet' });
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
      .then(found => {
        if (found) res.json({ result: found });
        else {
          next({
            code: 404,
            msg: 'resource with this id not found',
          });
        }
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to retrieve specified location',
          error: err,
        });
      });
  });

router
  .post('/', jsonParser, (req, res, next) => {
    new Location(req.body)
      .save()
      .then(posted => {
        if (posted) res.json({ result: posted });
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to create location',
          error: err,
        });
      });
  });

router
  .put('/:id', jsonParser, (req, res, next) => {
    Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .then(updatedLocation => {
        if (updatedLocation) res.json({ result: updatedLocation });
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to modify location',
          error: err,
        });
      });
  });

router
  .delete('/:id', (req, res, next) => {
    Location.findByIdAndRemove(req.params.id)
      .then(removedLocation => {
        if (removedLocation) res.json({ result: removedLocation });
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
