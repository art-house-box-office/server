import express from 'express';
import bodyParser from 'body-parser';
import User from '../models/user';
const jsonParser = bodyParser.json();
const router = module.exports = express.Router();


router
  // Retrieve all Users
  .get('/', (req, res, next) => {
    User
      .find({})
      .lean()
      .then(users => {
        res.json(users);
      })
      .catch(err => next({
        error: err,
        code: 404,
        msg: 'No users found',
      }));
  });

//   // Retrieve a specific Theater
//   .get('/:theaterId', (req, res, next) => {
//     Theater
//       .findById(req.params.theaterId)
//       .lean()
//       .then(theater => {
//         res.json(theater);
//       })
//       .catch(err => {
//         next({
//           code: 404,
//           msg: 'Theater not found',
//           error: err,
//         });
//       });
//   })
//
// // POST a Theater
//   .post('/', jsonParser, (req, res, next) => {
//     new Theater(req.body)
//       .save()
//       .then(theater => {
//         res.json({
//           status: 'posted',
//           result: theater,
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
// // PUT (aka update/change) a Theater
//
//   .put('/:id', jsonParser, (req, res, next) => {
//     Theater
//     .findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     )
//       .then(updatedTheater => {
//         if (updatedTheater) res.json({ result: updatedTheater });
//       })
//       .catch(err => {
//         next({
//           code: 500,
//           msg: 'unable to modify theater',
//           error: err,
//         });
//       });
//   })
//
// // DELETE a Theater
//
//   .delete('/:id', (req, res, next) => {
//     Theater
//     .findByIdAndRemove(req.params.id)
//       .then(removedTheater => {
//         if (removedTheater) res.json({ result: removedTheater });
//       })
//       .catch(err => {
//         next({
//           code: 500,
//           msg: 'unable to remove theater',
//           error: err,
//         });
//       });
//   });

export default router;
