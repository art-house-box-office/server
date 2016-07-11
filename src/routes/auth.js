import express from 'express';
const router = express.Router();
import bp from 'body-parser';
import User from '../models/user';
const bodyParser = bp.json();
import isAuth from '../lib/isAuth';
import token from '../lib/token';

router
  .get('/verify', isAuth, (req,res) => {
    res.json({ valid: 'true' });
  })
  .post('/signup', bodyParser, (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    delete req.body.password;

    if (!password) {
      return res.status(400).json({
        msg: 'No password entered. Please enter a password!'
      });
    }

    User.findOne({username})
      .then( exists => {
        if (exists) {
          return res.status(500).json({
            msg: 'Unable to create username',
            reason: 'Username already exists.  Please choose another.'
          });
        }

        const user = new User(req.body);
        user.generateHash(password);
        return user.save()
          .then(user => token.sign(user))
          .then(token => res.json( {token, id: user._id, username: user.username } ));
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to create user',
          error: err
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
          return res.status(400).json({ msg: 'Authentication failed.' });
        }

        return token.sign(user)
          .then(token => res.json({ token, id: user._id, username: user.username }));
      })
      .catch(next);
  });

module.exports = router;
