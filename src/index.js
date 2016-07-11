import './lib/setup-dotenv';
import './lib/setup-mongoose';

import app from './lib/app';

app.listen(process.env.PORT, err => {
  if (err) return console.error(err);
  return console.log(`Server listening on port: ${process.env.PORT}`);
});
