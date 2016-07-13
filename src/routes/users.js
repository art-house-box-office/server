import express from 'express';
import bodyParser from 'body-parser';
import hasRole from '../lib/hasRole';
import User from '../models/user';

const router = express.Router(); // eslint-disable-line
const jsonParser = bodyParser.json();

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
        code: 404,
        error: err,
        msg: 'No users found',
      }));
  })
  // Retrieve a specific User
  .get('/:userId', (req, res, next) => {
    User
      .findById(req.params.userId)
      .lean()
      .populate('company')
      .then(user => {
        res.json(user);
      })
      .catch(err => {
        next({
          code: 404,
          error: err,
          msg: 'User not found',
        });
      });
  })
  // Create a User
  .post('/', jsonParser, (req, res, next) => {
    new User(req.body)
      .save()
      .then(user => {
        res.json(user);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Unable to create user',
        });
      });
  })
  // Create a role for specific User
  .post('/:userId/roles/:role', hasRole('admin'), (req, res, next) => {
    User
      .findById(req.params.userId)
      .then(user => {
        if (!user) throw new Error('invalid authentication');
        const role = req.params.role;
        if (user.roles.indexOf(role) > -1) return user;
        user.roles.push(role);
        return user.save();
      })
      .then(user => {
        res.json({
          id: user.id,
          roles: user.roles,
        });
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Unable to add user role',
        });
      });
  })
  // Update/change a specific User
  .put('/:id', jsonParser, (req, res, next) => {
    User
      .findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
      .then(updatedUser => {
        if (updatedUser) res.json(updatedUser);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Unable to modify user',
        });
      });
  })
  // Remove a User
  .delete('/:id', (req, res, next) => {
    User
      .findByIdAndRemove(req.params.id)
      .then(removedUser => {
        if (removedUser) res.json(removedUser);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Unable to remove user',
        });
      });
  });

export default router;
