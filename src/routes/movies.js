import express from 'express';
import bodyParser from 'body-parser';
import Movie from '../models/movie';
const jsonParser = bodyParser.json();
const router = module.exports = express.Router();
import std404ErrMsg from '../lib/404';


router
  // Retrieve all Movies
  .get('/', (req, res, next) => {
    Movie
      .find({})
      .lean()
      .then(movies => {
        if (movies) res.json(movies);
        else next(std404ErrMsg);
      })
      .catch(err => next({
        error: err,
        code: 404,
        msg: 'No movies found',
      }));
  })

  // Retrieve a specific Movie
  .get('/:movieId', (req, res, next) => {
    Movie
      .findById(req.params.movieId)
      .lean()
      .then(movie => {
        if (movie) res.json(movie);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 404,
          msg: 'Movie not found',
          error: err,
        });
      });
  })

// POST a Movie
  .post('/', jsonParser, (req, res, next) => {
    new Movie(req.body)
      .save()
      .then(movie => {
        if (movie) res.json(movie);
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

// PUT (aka update/change) a Movie

  .put('/:id', jsonParser, (req, res, next) => {
    Movie
    .findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .then(updatedMovie => {
        if (updatedMovie) res.json(updatedMovie);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to modify movie',
          error: err,
        });
      });
  })

// DELETE a Company

  .delete('/:id', (req, res, next) => {
    Movie
    .findByIdAndRemove(req.params.id)
      .then(removedMovie => {
        if (removedMovie) res.json(removedMovie);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to remove movie',
          error: err,
        });
      });
  });

export default router;
