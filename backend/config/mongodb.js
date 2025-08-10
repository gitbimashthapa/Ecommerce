// MongoDB connection configuration - handles database connection with error handling and retry logic
import mongoose from "mongoose";

// Function to establish connection to MongoDB database
const connectDB = async () => {
    try {
        // Event listener for successful connection
        mongoose.connection.on("connected", () => {
            console.log("✅ Connected to MongoDB Atlas successfully");
        });

        // Event listener for connection errors
        mongoose.connection.on("error", (err) => {
            console.error("❌ MongoDB connection error:", err.message);
        });

        // Event listener for disconnection
        mongoose.connection.on("disconnected", () => {
            console.log("⚠️ MongoDB disconnected");
        });

        // Connection options for better reliability and security
        const connectionOptions = {
            retryWrites: true, // Automatically retry failed writes
            w: 'majority', // Write concern - wait for majority of replica set
            serverSelectionTimeoutMS: 10000, // Timeout for server selection
            socketTimeoutMS: 45000, // Socket timeout
            maxPoolSize: 10, // Maximum number of connections in pool
            ssl: true, // Enable SSL encryption
            tls: true, // Enable TLS
            tlsInsecure: false, // Strict SSL validation
        };

        // Actually connect to MongoDB using URL from environment variables
        await mongoose.connect(process.env.MONGODB_URL, connectionOptions);
        
    } catch (error) {
        // Handle connection errors with helpful debugging info
        console.error("❌ MongoDB connection failed:", error.message);
        
        // Common solutions for connection issues
        console.log("\n🔧 Troubleshooting steps:");
        console.log("1. Check your internet connection");
        console.log("2. Verify MongoDB Atlas IP whitelist includes your current IP");
        console.log("3. Ensure your MongoDB Atlas credentials are correct");
        console.log("4. Check if your network/firewall allows MongoDB connections");
        
        // Exit process with failure code
        process.exit(1);
    }
};

export default connectDB;