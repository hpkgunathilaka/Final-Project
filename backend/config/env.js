let cached;

function optional(name) {
  const value = process.env[name];
  return value ? String(value) : '';
}

function required(name) {
  const value = process.env[name];
  if (!value) {
    const err = new Error(`${name} is not set`);
    err.status = 500;
    throw err;
  }
  return value;
}

function getEnv() {
  if (cached) return cached;

  const nodeEnv = process.env.NODE_ENV || 'development';

  let jwtSecret = optional('JWT_SECRET');
  if (!jwtSecret) {
    if (nodeEnv === 'production') {
      const err = new Error('JWT_SECRET is not set');
      err.status = 500;
      throw err;
    }
    // Dev convenience: allow starting without JWT_SECRET.
    // Tokens will become invalid after a restart.
    // eslint-disable-next-line global-require
    jwtSecret = require('crypto').randomBytes(48).toString('hex');
    // eslint-disable-next-line no-console
    console.warn('[env] JWT_SECRET missing; generated a temporary secret for development.');
  }

  const corsOriginRaw = process.env.CORS_ORIGIN;
  const corsOrigins = corsOriginRaw
    ? corsOriginRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : ['*'];

  const trustProxy = String(process.env.TRUST_PROXY || '') === '1';

  cached = {
    nodeEnv,
    port: Number(process.env.PORT || 5000),
    mongoUri: required('MONGODB_URI'),
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigins,
    trustProxy
  };

  return cached;
}

module.exports = { getEnv };
