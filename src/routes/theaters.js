import express from 'express';
import bodyParser from 'body-parser';
import Theater from '../models/theater';
const jsonParser = bodyParser.json();
const router = module.exports = express.Router();


router
  // Retrieve all Theaters
  .get('/', (req, res, next) => {
    Theater
      .find({})
      .lean()
      .then(theaters => {
        res.json(theaters);
      })
      .catch(err => next({
        error: err,
        code: 404,
        msg: 'No theaters found',
      }));
  });

//   // Retrieve a specific Movie
//   .get('/:movieId', (req, res, next) => {
//     Movie
//       .findById(req.params.movieId)
//       .lean()
//       .then(movie => {
//         res.json(movie);
//       })
//       .catch(err => {
//         next({
//           code: 404,
//           msg: 'Movie not found',
//           error: err,
//         });
//       });
//   })
//
// // POST a Movie
//   .post('/', jsonParser, (req, res, next) => {
//     new Movie(req.body)
//       .save()
//       .then(movie => {
//         res.json({
//           status: 'posted',
//           result: movie,
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
// // PUT (aka update/change) a Movie
//
//   .put('/:id', jsonParser, (req, res, next) => {
//     Movie
//     .findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     )
//       .then(updatedMovie => {
//         if (updatedMovie) res.json({ result: updatedMovie });
//       })
//       .catch(err => {
//         next({
//           code: 500,
//           msg: 'unable to modify movie',
//           error: err,
//         });
//       });
//   })
//
// // DELETE a Company
//
//   .delete('/:id', (req, res, next) => {
//     Movie
//     .findByIdAndRemove(req.params.id)
//       .then(removedMovie => {
//         if (removedMovie) res.json({ result: removedMovie });
//       })
//       .catch(err => {
//         next({
//           code: 500,
//           msg: 'unable to remove movie',
//           error: err,
//         });
//       });
//   });

export default router;
