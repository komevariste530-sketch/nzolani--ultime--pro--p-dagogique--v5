const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentification requise.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expirée.' });
  }
}
function adminRequired(req, res, next) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Accès administrateur requis.' });
  next();
}
module.exports = { authRequired, adminRequired };
