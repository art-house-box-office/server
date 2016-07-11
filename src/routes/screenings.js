import express from 'express';
import bodyParser from 'body-parser';
import Screening from '../models/screening';
const jsonParser = bodyParser.json();
const router = module.exports = express.Router();


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

// POST a screening
router
    .use(jsonParser)
    .post('/', (req, res) => {
      new Screening(req.body)
        .save()
        .then(screening => {
          res.json({
            status: 'posted',
            result: screening,
          });
        })
        .catch(err => {
          res.json({
            status: 'error',
            result: 'server err',
            error: err,
          });
        });
    });
