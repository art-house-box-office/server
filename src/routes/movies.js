import express from 'express';
import bodyParser from 'body-parser';
import std404ErrMsg from '../lib/404';
import hasRole from '../lib/hasRole';
import Movie from '../models/movie';
import * from '../lib/omdb';
const router = express.Router(); // eslint-disable-line
const jsonParser = bodyParser.json();

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
        code: 404,
        error: err,
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
          error: err,
          msg: 'Movie not found',
        });
      });
  })
  // Create a Movie
  .post('/', jsonParser, (req, res, next) => {
    omdb.title(req.body.title)
      .then(movie => {
        let newMovie = {}
        if (movie) {
          newMovie.OMDb = true;
          newMovie.OMDbData = movie;
          newMovie.OMDbRef = movie.imdb;
          newMovie.title = movie.title;
          newMovie.genres = movie.genres;
          newMovie.released = movie.released;
          newMovie.directors = movie.directors;
          newMovie.countries = movie.countries;
          if (movie.metascore) newMovie.metascore = movie.metascore;
        } else {
          newMovie = req.body;
          newMovie.OMDb = false;
        }
        return new Movie(newMovie).save();
      })
      .then(movie => {
        if (movie) res.json(movie)
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Unable to create movie',
        });
      });
  })
  // Update/change a specific Movie
  .put('/:id', jsonParser, (req, res, next) => {
    Movie
      .findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
      .then(updatedMovie => {
        if (updatedMovie) res.json(updatedMovie);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'Unable to modify movie',
          error: err,
        });
      });
  })
  // Remove a Movie
  .delete('/:id', hasRole('admin'), (req, res, next) => {
    Movie
    .findByIdAndRemove(req.params.id)
      .then(removedMovie => {
        if (removedMovie) res.json(removedMovie);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Unable to remove movie',
        });
      });
  });

export default router;
