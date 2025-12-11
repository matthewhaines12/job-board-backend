const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/connectDB');

const jobsRouter = require('./routes/jobsRoute');
const authRouter = require('./routes/authRoute');
const savedJobsRouter = require('./routes/usersRoute');

const app = express();
const PORT = process.env.PORT || 3001;

// React local dev server URL
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// CORS configuration for local React frontend
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', savedJobsRouter);

app.get('/', (req, res) => {
  res.send('Job Board Backend is running');
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
