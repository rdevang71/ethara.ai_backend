require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const teamRoutes = require('./routes/teams');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();

const FRONTEND_ORIGINS = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_URL || '';
const allowedOrigins = FRONTEND_ORIGINS ? FRONTEND_ORIGINS.split(',').map(s => s.trim()).filter(Boolean) : [];
const allowAll = allowedOrigins.length === 0;
console.log('Configured CORS allowed origins:', allowAll ? '[ALL]' : allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowAll) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    // explicitly deny
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 204
}));

// For browsers: respond to preflight requests with appropriate headers when origin is allowed
app.options('*', (req, res) => {
  const origin = req.get('Origin');
  if (!origin) return res.sendStatus(204);
  if (allowAll || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', allowAll ? '*' : origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204);
  }
  return res.sendStatus(403);
});
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect DB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
