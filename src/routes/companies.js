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
  });
  // Retrieve a specific Screening
//   .get('/:screeningId', (req, res, next) => {
//     Screening
//       .findById(req.params.screeningId)
//       .lean()
//       .then(screening => {
//         res.json(screening);
//       })
//       .catch(err => {
//         next({
//           code: 404,
//           msg: 'Screening not found',
//           error: err,
//         });
//       });
//   })
//
// // POST a screening
//   .post('/', jsonParser, (req, res, next) => {
//     new Screening(req.body)
//       .save()
//       .then(screening => {
//         res.json({
//           status: 'posted',
//           result: screening,
//         });
//       })
//       .catch(err => {
//         next({
//           status: 'error',
//           result: 'server err',
//           error: err,
//         });
//       });
//   })
//
// // PUT (aka update/change) a Screening
//
//   .put('/:id', jsonParser, (req, res, next) => {
//     Screening
//     .findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     )
//       .then(updatedScreening => {
//         if (updatedScreening) res.json({ result: updatedScreening });
//       })
//       .catch(err => {
//         next({
//           code: 500,
//           msg: 'unable to modify screening',
//           error: err,
//         });
//       });
//   })
//
// // DELETE a screening
//
//   .delete('/:id', (req, res, next) => {
//     Screening
//     .findByIdAndRemove(req.params.id)
//       .then(removedScreening => {
//         if (removedScreening) res.json({ result: removedScreening });
//       })
//       .catch(err => {
//         next({
//           code: 500,
//           msg: 'unable to remove screening',
//           error: err,
//         });
//       });
//   });

export default router;
