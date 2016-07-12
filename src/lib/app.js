import express from 'express';
const app = express();
export default app;
import morgan from 'morgan';

import cors from './cors';
import auth from '../routes/auth';
import screenings from '../routes/screenings';
import companies from '../routes/companies';
import locations from '../routes/locations';
import movies from '../routes/movies';
import theaters from '../routes/theaters';
import users from '../routes/users';
import isAuth from './isAuth';
import hasRole from './hasRole';

// app.use(morgan('dev'));
app.use(cors('*'));
app.use('/api', auth);

app.use('/api/locations', isAuth, locations);
app.use('/api/screenings', isAuth, screenings);
app.use('/api/companies', isAuth, companies);
app.use('/api/movies', isAuth, movies);
app.use('/api/theaters', isAuth, theaters);
app.use('/api/users', isAuth, hasRole('admin'), users);


// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.code || 500).json({ error: err.error || 'Server error', msg: err.msg });
});
