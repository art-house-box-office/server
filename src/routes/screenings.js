import express from 'express';
// const bodyParser = require('body-parser');
import Screening from '../models/screening';
const router = module.exports = express.Router();
// const jsonParser = bodyParser.json();

router
  // Retrieve all Screenings
  .get('/', (req, res, next) => {
    Screening
      .find({})
      .lean()
      .then(screenings => {
        res.json(screenings);
      })
      .catch(err => next({
        error: err,
        code: 404,
        msg: 'No screenings found'
      }));
  })
  // Retrieve a specific Screening
  .get('/:screeningId', (req, res, next) => {
    Screening
      .findById(req.params.screeningId)
      .lean()
      .then(screening => {
        res.json(screening);
      })
      .catch(err => {
        res.json({
          code: 404,
          msg: 'Screening not found',
          error: err,
        });
      });
  });
