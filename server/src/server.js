
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const { setupInitialAdmin } = require('./controllers/auth.controller');

// Environment variables
dotenv.config();

// MongoDB connection string and server port
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

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