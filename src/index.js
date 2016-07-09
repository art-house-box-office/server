import dotenv from 'dotenv';
import app from './lib/app';

dotenv.config();

const port = process.argv[2] || 9000;

app.listen(port, err => {
  if (err) return console.error(err);

  console.log(process.env.FOO);
  
  return console.log(`Magic happens at: http://localhost:${port}/`);
});
