const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getEnv } = require('../config/env');
const { validateRegisterInput, validateLoginInput } = require('../utils/validation');

function signToken(user) {
  const payload = { sub: user._id.toString(), role: user.role, email: user.email, name: user.name };
  const env = getEnv();
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

async function register(req, res, next) {
  try {
    const parsed = validateRegisterInput(req.body || {});
    if (!parsed.ok) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.errors });
    }

    const { name, email, password, role, organizationName, skills } = parsed.values;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      organizationName: role === 'ngo' ? organizationName : '',
      skills: role === 'partner' ? skills : []
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const parsed = validateLoginInput(req.body || {});
    if (!parsed.ok) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.errors });
    }

    const { email, password } = parsed.values;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked. Please contact support.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login };
