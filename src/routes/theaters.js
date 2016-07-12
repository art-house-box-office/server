import express from 'express';
import bodyParser from 'body-parser';
import Theater from '../models/theater';
const jsonParser = bodyParser.json();
const router = module.exports = express.Router();
import std404ErrMsg from '../lib/404';

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
        error: err,
        code: 404,
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
          msg: 'Theater not found',
          error: err,
        });
      });
  })

// POST a Theater
  .post('/', jsonParser, (req, res, next) => {
    console.log('Theater Post req.body is: ', req.body);
    new Theater(req.body)
      .save()
      .then(theater => res.json(theater))
      .catch(err => {
        next({
          status: 'error',
          result: 'server err',
          error: err,
        });
      });
  })

// PUT (aka update/change) a Theater

  .put('/:id', jsonParser, (req, res, next) => {
    Theater
    .findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .then(updatedTheater => {
        if (updatedTheater) res.json(updatedTheater);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to modify theater',
          error: err,
        });
      });
  })

// DELETE a Theater

  .delete('/:id', (req, res, next) => {
    Theater
    .findByIdAndRemove(req.params.id)
      .then(removedTheater => {
        if (removedTheater) res.json(removedTheater);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to remove theater',
          error: err,
        });
      });
  });

export default router;
