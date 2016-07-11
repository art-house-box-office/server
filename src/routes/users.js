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
  })

  // Retrieve a specific User
  .get('/:userId', (req, res, next) => {
    User
      .findById(req.params.userId)
      .lean()
      .then(user => {
        res.json(user);
      })
      .catch(err => {
        next({
          code: 404,
          msg: 'User not found',
          error: err,
        });
      });
  })

// POST a User
  .post('/', jsonParser, (req, res, next) => {
    new User(req.body)
      .save()
      .then(user => {
        res.json({
          status: 'posted',
          result: user,
        });
      })
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
    User
    .findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .then(updatedUser => {
        if (updatedUser) res.json({ result: updatedUser });
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to modify User',
          error: err,
        });
      });
  });

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
