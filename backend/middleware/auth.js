const jwt = require('jsonwebtoken');
const { getEnv } = require('../config/env');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  try {
    const payload = jwt.verify(token, getEnv().jwtSecret);
    const user = await User.findById(payload.sub).select('role email name isBlocked');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token user' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    req.user = {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name
    };
    return next();
  } catch (err) {
    if (err && err.status === 500) {
      return next(err);
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
