import express from 'express';
const router = express.Router();
import bp from 'body-parser';
import User from '../models/user';
const bodyParser = bp.json();
import isAuth from '../lib/isAuth';
import token from '../lib/token';

router
  .get('/verify', isAuth, (req, res) => {
    console.log(req.user);
    // User.findOne({username})
    res.json({ valid: 'true', user: { id: req.user.id, username: req.user.username}});
  })
  .post('/signup', bodyParser, (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    delete req.body.password;

    if (!password) {
      return res.status(400).json({
        msg: 'No password entered. Please enter a password!',
      });
    }

    return User.findOne({ username })
      .then(exists => {
        if (exists) {
          return next({
            code: 500,
            error: 'Unable to create username',
            msg: 'Username already exists.  Please choose another.',
          });
        }

        const user = new User(req.body);
        user.generateHash(password);
        return user.save()
          .then(savedUser => token.sign(savedUser))
          .then(returnedToken => res.json({
            returnedToken,
            id: user._id,
            username: user.username,
          }));
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to create user',
          error: err,
        });
      });
  })

  .post('/signin', bodyParser, (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    delete req.body;
    User.findOne({ username })
      .then(user => {
        if (!user || !user.compareHash(password)) {
          return next({ code: 400, error: 'Authentication failed.', msg: 'Username and/or password does not match.' });
        }
        return token.sign(user)
          .then(returnedToken => res.json({
            returnedToken,
            id: user._id,
            username: user.username,
          }));
      })
      .catch(next);
  });

module.exports = router;
