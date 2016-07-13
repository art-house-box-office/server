import tokenCheck from './token';

export default function isAuth(req, res, next) {
  if (req.method === 'OPTIONS') return next();

  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace('Bearer ', '') : '';

  if (!token) {
    return next({
      code: 403,
      error: 'No token provided',
    });
  }

  return tokenCheck.verify(token)
    .then(payload => {
      req.user = payload; // eslint-disable-line
      next();
    })
    .catch(() => {
      next({
        code: 403,
        error: 'Invalid token',
      });
    });
}
