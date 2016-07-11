const express = require('express');
// const bodyParser = require('body-parser');
const Screening = require('../models/screening');
const router = module.exports = express.Router();
// const jsonParser = bodyParser.json();

router
  // Retrieve all Screenings
  .get('/', (req, res) => {
    Screening
      .find({})
      .lean()
      .then(screenings => {
        const resObj = {
          status: 'error',
          result: 'No Screenings Added.',
        };

        if (screenings.length > 0) {
          resObj.status = 'success';
          resObj.result = screenings;
        }

        res.json(resObj);
      });
  })
  // Retrieve a specific Screening
  .get('/:screeningId', (req, res) => {
    Screening
      .findById(req.params.screeningId)
      .lean()
      .then(screening => {
        const resObj = {
          status: 'error',
          result: `SCREENING NOT FOUND: ${screening.name} does not exist.`,
        };

        if (screening) {
          resObj.status = 'success';
          resObj.result = screening;
        }

        res.json(resObj);
      })
      .catch(err => {
        res.json({
          status: 'error',
          result: 'Server error',
          error: err,
        });
      });
  });
