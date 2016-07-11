import express from 'express';
import morgan from 'morgan';
import cors from './cors';
import locations from '../routes/locations';
const app = express();
export default app;

app.use(morgan('dev'));
app.use(cors('*'));

app.use('/api/locations', locations);

// eslint-disable-next-line  no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.code || 500).json({ error: err.error || 'Server error', msg: err.msg });
});
