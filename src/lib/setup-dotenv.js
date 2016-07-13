import dotenv from 'dotenv';

const dotenvFile = process.env.NODE_ENV === 'production' ? './.env' : './.env-dev';

dotenv.config({
  path: dotenvFile,
});

export default dotenv;
