
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const { setupInitialAdmin } = require('./controllers/auth.controller');

// Environment variables
dotenv.config();

// MongoDB connection string and server port
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

/**
* Connects to MongoDB and starts the Express server
* Also sets up initial admin user if needed
*/
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        // Create admin user if it doesn't exist
        setupInitialAdmin();
        console.log('Connected to MongoDB Atlas');

    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Initialize database connection and server
connectDB();