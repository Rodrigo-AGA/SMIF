const crypto = require('crypto');

exports.authMiddleware = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ status: 'fail', message: 'Acceso no autorizado' });
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (roles.includes(req.session.rol)) return next();
  return res.status(403).json({ status: 'fail', message: 'No tienes permisos para acceder a este recurso' });
};

exports.requireAdminKey = (req, res, next) => {
  const expected = Buffer.from(process.env.ADMIN_KEY || '');
  const provided = Buffer.from(req.get('x-admin-key') || '');
  const ok = expected.length > 0 &&
             expected.length === provided.length &&
             crypto.timingSafeEqual(expected, provided);
  if (!ok) return res.status(403).json({ status: 'fail', message: 'No autorizado' });
  next();
};
