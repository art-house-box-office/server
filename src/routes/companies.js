import express from 'express';
import bodyParser from 'body-parser';
import Company from '../models/company';
const jsonParser = bodyParser.json();
const router = module.exports = express.Router();
import std404ErrMsg from '../lib/404';
import hasRole from '../lib/hasRole';


router
  // Retrieve all Companies
  .get('/', (req, res, next) => {
    Company
      .find({})
      .lean()
      .then(companies => {
        if (companies) res.json(companies);
        else next(std404ErrMsg);
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
        if (company) res.json(company);
        else next(std404ErrMsg);
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
        if (company) res.json(company);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          msg: 'unable to create company',
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
        if (updatedCompany) res.json(updatedCompany);
        else next(std404ErrMsg);
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

  .delete('/:id', hasRole('admin'), (req, res, next) => {
    Company
    .findByIdAndRemove(req.params.id)
      .then(removedCompany => {
        if (removedCompany) res.json(removedCompany);
        else next(std404ErrMsg);
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
