<<<<<<< HEAD
import { MongoMemoryServer } from "mongodb-memory-server";
import * as mongoose from "mongoose";
=======
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
>>>>>>> 684a3db (feat: enhance test setup with MongoDB Memory Server integration and improved error handling)

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

<<<<<<< HEAD
// export async function clearTestDatabase() {
//     await CompanyModel.deleteMany({});
//     await UserModel.deleteMany({});
//     await InterviewSessionModel.deleteMany({});
//     await JobListingModel.deleteMany({});
// }

// Start MongoDB Memory Server
beforeAll(async () => {
    if (mongoose.connection?.readyState !== 0) {
=======
// Start MongoDB Memory Server
async function setupTestDatabase() {
    // Close any existing connection first
    if (mongoose.connection.readyState !== 0) {
>>>>>>> 684a3db (feat: enhance test setup with MongoDB Memory Server integration and improved error handling)
        await mongoose.disconnect();
    }

    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
<<<<<<< HEAD

    process.env.MONGO_URI = mongoUri;

    global.mongoServer = mongoServer;
    global.mongoUri = mongoUri;

    await mongoose.connect(mongoUri);
    console.log("Connected to the in-memory database");
});

// Cleanup after all tests
afterAll(async () => {
    if (mongoose.connection?.readyState !== 0) {
=======
    
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
>>>>>>> 684a3db (feat: enhance test setup with MongoDB Memory Server integration and improved error handling)
        await mongoose.disconnect();
    }
    if (global.mongoServer) {
        await global.mongoServer.stop();
    }
<<<<<<< HEAD
    console.log("Disconnected and stopped MongoDB memory server");
=======
});

// Prevent unhandled promise rejections from failing silently
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
    process.exit(1);
>>>>>>> 684a3db (feat: enhance test setup with MongoDB Memory Server integration and improved error handling)
});
