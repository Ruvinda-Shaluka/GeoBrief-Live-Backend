import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) {
            return;
        }
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI is not defined in the environment variables");
        }

        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Fail fast after 5s if blocked by MongoDB Atlas IP whitelist
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : error}`);
        throw error;
    }
};

export default connectDB;