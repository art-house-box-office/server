import express from 'express';
import bodyParser from 'body-parser';
import Location from '../models/location';

const router = express.Router();

router
  .get('/', (req, res) => {
    res.send('hello locations');
  });

export default router;
