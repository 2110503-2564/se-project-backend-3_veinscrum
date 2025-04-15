import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Environment variables for testing
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRE = "1h";
process.env.JWT_COOKIE_EXPIRE = "1";
process.env.NODE_ENV = "test";

// Global variable to store MongoDB instance (must be compatible with Jest's globals)
declare global {
    var mongoServer: MongoMemoryServer;
    var mongoUri: string;
}

// Start MongoDB Memory Server
async function setupTestDatabase() {
    // Close any existing connection first
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Set the connection string for tests
    process.env.MONGO_URI = mongoUri;
    
    // Store for later access
    global.mongoServer = mongoServer;
    global.mongoUri = mongoUri;

    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
    console.log('Connected to the in-memory database');
}

// Setup database for all tests
setupTestDatabase().catch(error => {
    console.error("Error setting up test database:", error);
    process.exit(1);
});

// Clean up when tests complete or are interrupted
process.on('SIGTERM', async () => {
    console.log('Cleaning up test environment...');
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (global.mongoServer) {
        await global.mongoServer.stop();
    }
});

// Prevent unhandled promise rejections from failing silently
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
    process.exit(1);
});
