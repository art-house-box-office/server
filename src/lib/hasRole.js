export default function hasRole(role) {
  return function checkRole(req, res, next) {
    if (req.user.roles.indexOf(role) > -1) {
      next();
    } else {
      next({
        code: 401,
        msg: 'Not authorized',
      });
    }
  };
}
