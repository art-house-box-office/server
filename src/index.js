import dotenv from 'dotenv';
dotenv.config();
import app from './lib/app';

const port = process.argv[2] || 9000;
import './lib/setup-mongoose';

app.listen(port, err => {
  if (err) return console.error(err);
  return console.log(`Server listening at: http://localhost:${port}/`);
});
