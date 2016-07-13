import './lib/setup-dotenv';
import './lib/setup-mongoose';
import app from './lib/app';

app.listen(process.env.PORT, err => {
  if (err) return console.error(err); // eslint-disable-line
  return console.log(`Server listening on port: ${process.env.PORT}`); // eslint-disable-line
});
