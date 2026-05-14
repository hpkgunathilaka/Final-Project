const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const taskRoutes = require('./routes/taskRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { getEnv } = require('./config/env');

const app = express();

const env = getEnv();

if (env.trustProxy) {
  app.set('trust proxy', 1);
}

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server, curl, and same-origin/no-origin requests
    if (!origin) return callback(null, true);

    if (env.corsOrigins.includes('*')) return callback(null, true);
    if (env.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'smart-collaboration-platform-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', matchingRoutes);
app.use('/api', taskRoutes);
app.use('/api', messageRoutes);
app.use('/api/admin', adminRoutes);

// Optional: serve frontend statics in production.
// This is useful for single-server deployments (backend + frontend from same host).
if (env.nodeEnv === 'production') {
  const publicDir = path.join(__dirname, '..', 'frontend', 'public');
  app.use(express.static(publicDir));
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
