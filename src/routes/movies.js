import express from 'express';
import bodyParser from 'body-parser';
import Movie from '../models/movie';
const jsonParser = bodyParser.json();
const router = module.exports = express.Router();


router
  // Retrieve all Movies
  .get('/', (req, res, next) => {
    Movie
      .find({})
      .lean()
      .then(movies => {
        res.json(movies);
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
        res.json(movie);
      })
      .catch(err => {
        next({
          code: 404,
          msg: 'Movie not found',
          error: err,
        });
      });
  });

// // POST a Company
//   .post('/', jsonParser, (req, res, next) => {
//     new Company(req.body)
//       .save()
//       .then(company => {
//         res.json({
//           status: 'posted',
//           result: company,
//         });
//       })
//       .catch(err => {
//         next({
//           status: 'error',
//           result: 'server err',
//           error: err,
//         });
//       });
//   })
//
// // PUT (aka update/change) a Company
//
//   .put('/:id', jsonParser, (req, res, next) => {
//     Company
//     .findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     )
//       .then(updatedCompany => {
//         if (updatedCompany) res.json({ result: updatedCompany });
//       })
//       .catch(err => {
//         next({
//           code: 500,
//           msg: 'unable to modify company',
//           error: err,
//         });
//       });
//   })
//
// // DELETE a Company
//
//   .delete('/:id', (req, res, next) => {
//     Company
//     .findByIdAndRemove(req.params.id)
//       .then(removedCompany => {
//         if (removedCompany) res.json({ result: removedCompany });
//       })
//       .catch(err => {
//         next({
//           code: 500,
//           msg: 'unable to remove company',
//           error: err,
//         });
//       });
//   });

export default router;
