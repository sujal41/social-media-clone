const mongoose = require('mongoose');
require('dotenv').config();


async function connectDB() {
    try {
        await mongoose.connect( process.env.MONGO_URI);
        console.log("Connected to MongoDB Successfully");
    } catch (error) {
        console.error("failed to connect to MongoDB: ", error);
        process.exit(1);
    }
}

module.exports = { connectDB };