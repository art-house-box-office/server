import express from 'express';
import bodyParser from 'body-parser';
import isAuth from '../lib/isAuth';
import token from '../lib/token';
import User from '../models/user';

const router = express.Router(); // eslint-disable-line
const jsonParser = bodyParser.json();

router
  // Verify user
  .get('/verify', isAuth, (req, res) => {
    res.json({
      valid: 'true',
      user: {
        id: req.user.id,
        username: req.user.username,
      },
    });
  })
  // User signup
  .post('/signup', jsonParser, (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    delete req.body.password; // eslint-disable-line

    if (!password) {
      return res.status(400).json({
        code: 400,
        msg: 'No password entered. Please enter a password!',
      });
    }

    return User.findOne({ username })
      .then(exists => {
        if (exists) {
          return next({
            code: 500,
            error: 'Unable to create username',
            msg: 'Username already exists. Please choose another.',
          });
        }

        const user = new User(req.body);
        user.generateHash(password);

        return user.save()
          .then(savedUser => token.sign(savedUser))
          .then(returnedToken => res.json({
            returnedToken,
            id: user._id, // eslint-disable-line
            username: user.username,
          }));
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'unable to create user',
        });
      });
  })
  // User sigin
  .post('/signin', jsonParser, (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    delete req.body; // eslint-disable-line

    User.findOne({ username })
      .then(user => {
        if (!user || !user.compareHash(password)) {
          return next({
            code: 400,
            error: 'Authentication failed.',
            msg: 'Username and/or password does not match.',
          });
        }
        return token.sign(user)
          .then(returnedToken => res.json({
            returnedToken,
            id: user._id, // eslint-disable-line
            username: user.username,
          }));
      })
      .catch(next);
  });

export default router;
