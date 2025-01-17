// app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./routes/index'); // Index file in routes folder
const { errorHandler } = require('./middlewares/error.middleware');

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body
app.use(helmet()); // Security headers

// Logging
app.use(morgan('dev'));


// All routes 
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;