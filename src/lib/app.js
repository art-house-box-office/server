import express from 'express';
import morgan from 'morgan';
import cors from './cors';
const app = express();
export default app;
import auth from '../routes/auth';
import screenings from '../routes/screenings';
import companies from '../routes/companies';
import locations from '../routes/locations';
import movies from '../routes/movies';

app.use(morgan('dev'));
app.use(cors('*'));
app.use('/api', auth);

app.use('/api/locations', locations);
app.use('/api/screenings', screenings);
app.use('/api/companies', companies);
app.use('/api/movies', movies);


// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.code || 500).json({ error: err.error || 'Server error', msg: err.msg });
});
