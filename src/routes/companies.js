import express from 'express';
import bodyParser from 'body-parser';
import Company from '../models/company';
const jsonParser = bodyParser.json();
const router = module.exports = express.Router();


router
  // Retrieve all Companies
  .get('/', (req, res, next) => {
    Company
      .find({})
      .lean()
      .then(companies => {
        res.json(companies);
      })
      .catch(err => next({
        error: err,
        code: 404,
        msg: 'No companies found',
      }));
  })

  // Retrieve a specific Company
  .get('/:companyId', (req, res, next) => {
    Company
      .findById(req.params.companyId)
      .lean()
      .then(company => {
        res.json(company);
      })
      .catch(err => {
        next({
          code: 404,
          msg: 'Company not found',
          error: err,
        });
      });
  })

// POST a Company
  .post('/', jsonParser, (req, res, next) => {
    new Company(req.body)
      .save()
      .then(company => {
        res.json({
          status: 'posted',
          result: company,
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

// PUT (aka update/change) a Company

  .put('/:id', jsonParser, (req, res, next) => {
    Company
    .findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .then(updatedCompany => {
        if (updatedCompany) res.json({ result: updatedCompany });
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to modify company',
          error: err,
        });
      });
  })

// DELETE a Company

  .delete('/:id', (req, res, next) => {
    Company
    .findByIdAndRemove(req.params.id)
      .then(removedCompany => {
        if (removedCompany) res.json({ result: removedCompany });
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to remove company',
          error: err,
        });
      });
  });

export default router;
