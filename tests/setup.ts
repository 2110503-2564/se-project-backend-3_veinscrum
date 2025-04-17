import { initializeApp } from "@/app";
import { Express } from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as mongoose from "mongoose";

// Environment variables for testing
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRE = "1h";
process.env.JWT_COOKIE_EXPIRE = "1";
process.env.NODE_ENV = "test";

// Global variable to store MongoDB instance (must be compatible with Jest's globals)
declare global {
    var mongoServer: MongoMemoryServer;
    var mongoUri: string;
    var app: Express;
}

// Start MongoDB Memory Server
beforeAll(async () => {
    if (mongoose.connection?.readyState !== 0) {
        await mongoose.disconnect();
    }

    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    process.env.MONGO_URI = mongoUri;

    const app = initializeApp();

    global.mongoServer = mongoServer;
    global.mongoUri = mongoUri;
    global.app = app;

    await mongoose.connect(mongoUri);
    console.log("Connected to the in-memory database");
});

// Cleanup after all tests
afterAll(async () => {
    if (mongoose.connection?.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (global.mongoServer) {
        await global.mongoServer.stop();
    }
    console.log("Disconnected and stopped MongoDB memory server");
});
