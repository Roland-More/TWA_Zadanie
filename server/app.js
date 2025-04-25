const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const izbaRoutes = require('./routes/izbaRoutes');
const ziakRoutes = require('./routes/ziakRoutes');
const kartaRoutes = require('./routes/kartaRoutes');
const stravaRoutes = require('./routes/stravaRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3001']
}));

// Verify database connection at startup
(async () => {
  try {
    await poolPromise;
    console.log('Successfully connected to the database');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1); // Exit if DB connection fails
  }
})();

// Define routes
app.use('/izba', izbaRoutes);
app.use('/ziak', ziakRoutes);
app.use('/karta', kartaRoutes);
app.use('/strava', stravaRoutes);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server beží na porte ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
  // Don't exit the process in production, just log
});
