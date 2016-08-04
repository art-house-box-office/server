import express from 'express';
import morgan from 'morgan';
import cors from './cors';
import isAuth from './isAuth';
import auth from '../routes/auth';
import companies from '../routes/companies';
import locations from '../routes/locations';
import movies from '../routes/movies';
import screenings from '../routes/screenings';
import theaters from '../routes/theaters';
import users from '../routes/users';
import runs from '../routes/runs';
import compress from 'compression';

const app = express();

if (process.env.NODE_ENV !== 'production' && !process.env.TEST) app.use(morgan('dev'));
app.use(cors(process.env.CDN_URL));
app.use(compress());
app.use('/api', auth);
app.use('/api/locations', isAuth, locations);
app.use('/api/screenings', screenings);
app.use('/api/companies', isAuth, companies);
app.use('/api/movies', isAuth, movies);
app.use('/api/theaters', isAuth, theaters);
app.use('/api/runs', isAuth, runs);
app.use('/api/users', isAuth, users);

app.use((err, req, res, next) => { // eslint-disable-line
  if (!process.env.TEST) console.error(err); // eslint-disable-line
  res.status(err.code || 500).json({
    code: 500,
    error: err.error || 'Server error',
    msg: err.msg,
  });
});

export default app;
