import express from 'express';
import bodyParser from 'body-parser';
import Location from '../models/location';
const jsonParser = bodyParser.json();

const router = express.Router();

router
  .get('/', (req, res, next) => {
    Location.find()
      .then(list => {
        res.json({ result: list });
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to retrive location list',
          error: err,
        });
      });
  })
  .get('/:id', (req, res, next) => {
    Location.findById(req.params.id)
      .then(found => {
        res.json({ result: found });
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to retrieve specified location',
          error: err,
        });
      });
  });

router
  .post('/', jsonParser, (req, res, next) => {
    new Location(req.body)
      .save()
      .then(posted => {
        res.json({ result: posted });
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to create location',
          error: err,
        });
      });
  });

export default router;
