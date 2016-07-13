import express from 'express';
import bodyParser from 'body-parser';
import std404ErrMsg from '../lib/404';
import hasRole from '../lib/hasRole';
import Company from '../models/company';

const router = express.Router(); // eslint-disable-line
const jsonParser = bodyParser.json();

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
        code: 404,
        error: err,
        msg: 'No companies found',
      }));
  })
  // Retrieve a specific Company
  .get('/:companyId', (req, res, next) => {
    Company
      .findById(req.params.companyId)
      .lean()
      // .populate('locations')
      .then(company => {
        if (company) res.json(company);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 404,
          error: err,
          msg: 'Company not found',
        });
      });
  })
  // Create a Company
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
          error: err,
          msg: 'Unable to create company',
        });
      });
  })
  // Update/change a specific Company
  .put('/:id', jsonParser, (req, res, next) => {
    Company
      .findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
      .then(updatedCompany => {
        if (updatedCompany) res.json(updatedCompany);
        else next(std404ErrMsg);
      })
      .catch(err => {
        next({
          code: 500,
          error: err,
          msg: 'Unable to modify company',
        });
      });
  })
  // Remove a Company
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
          error: err,
          msg: 'unable to remove company',
        });
      });
  });

export default router;
