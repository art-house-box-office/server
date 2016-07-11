import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();
const superSecret = process.env.APP_SECRET;
if (!superSecret) {
  console.log('env variable APP_SECRET not set in token.js!');
  process.exit(1);
}

module.exports = {
  sign(user) {
    return new Promise((resolve, reject) => {
      jwt.sign({
        id: user.id,
        roles: user.roles,
        username: user.username,
      }, superSecret, null, (err, token) => {
        if (err) return reject(err);
        return resolve(token);
      });
    });
  },

  verify(token) {
    if (!token) {
      return Promise.reject('No token provided!');
    }
    return new Promise((resolve, reject) => {
      jwt.verify(token, superSecret, (err, payload) => {
        if (err) return reject(err);
        return resolve(payload);
      });
    });
  },
};
