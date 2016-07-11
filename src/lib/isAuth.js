import tokenCheck from './token';

export default function isAuth (req, res, next) {
  if (req.method === 'OPTIONS') return next();
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace('Bearer ', '') : '';

  if (!token) {
    return next({ code: 403, error: 'no token provided' });
  }

  tokenCheck.verify(token)
    .then(payload => {
      // eslint-disable-next-line no-param-reassign
      req.user = payload;
      next();
    })
    .catch(() => {
      next({ code: 403, error: 'invalid token' });
    });
};
