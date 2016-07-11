import express from 'express';
import bodyParser from 'body-parser';
import Location from '../models/locations';

const router = express.Router();

router
  .get('/', (req, res) => {
    res.send('hello locations');
  });

export default router;
