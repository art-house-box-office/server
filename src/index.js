import app from './lib/app';

const port = process.argv[2] || 9000;

app.listen(port, err => {
  if (err) return console.error(err);

  return console.log(`Magic happens at: http://localhost:${port}/`);
});
