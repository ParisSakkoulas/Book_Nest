
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const { setupInitialAdmin } = require('./controllers/auth.controller');

// Environment variables
dotenv.config();

// MongoDB connection string and server port
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;



const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        setupInitialAdmin();

        console.log('Connected to MongoDB');

    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

connectDB();