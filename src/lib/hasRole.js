export default function (role) {
  return function (req, res, next) {
    if (req.user.roles.indexOf(role) > -1) {
      next();
    } else {
      next({
        code: 401,
        msg: 'Not Authorized',
      });
    }
  };
}
