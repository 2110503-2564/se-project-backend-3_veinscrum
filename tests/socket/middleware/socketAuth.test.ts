import { initializeApp } from "@/app";
import { CompanyModel } from "@/models/Company";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import { UserModel } from "@/models/User";
import { initializeSocket } from "@/socket/socket";
import type { Express } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { createServer } from "node:http";
import type { Socket } from "socket.io-client";
import { io as Client } from "socket.io-client";

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
    __esModule: true,
    default: {
        verify: jest.fn(),
        sign: jest.fn(),
        JsonWebTokenError: class JsonWebTokenError extends Error {},
    },
}));

let app: Express;
let httpServer: ReturnType<typeof createServer>;
let clientSocket: Socket;
const PORT = 15052;

beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
    app = initializeApp();
    httpServer = createServer(app);
    initializeSocket(httpServer);
    httpServer.listen(PORT, () => {
        console.log(
            `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
        );
    });
});

afterAll(() => {
    httpServer.close();
});

describe("socketAuth Middleware", () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await UserModel.deleteMany({});
    });

    afterEach(() => {
        if (clientSocket) {
            clientSocket.close();
        }
    });

    it("should connect successfully with valid token and user", async () => {
        const user = await UserModel.create({
            name: "Test User",
            email: "user@test.com",
            password: "password123",
            tel: "1234567890",
            role: "user",
        });

        const companyId = new mongoose.Types.ObjectId();
        const companyOwner = await UserModel.create({
            name: "Company Owner",
            email: "owner@test.com",
            password: "password123",
            tel: "0987654321",
            role: "company",
            company: companyId,
        });

        const company = await CompanyModel.create({
            _id: companyId,
            name: "Test Company",
            address: "123 Test St",
            website: "https://test.com",
            description: "A test company",
            tel: "5555555555",
            owner: companyOwner._id,
        });

        const jobListing = await JobListingModel.create({
            company: company._id,
            jobTitle: "Software Engineer",
            description: "Develop amazing software",
            image: "image.jpg",
        });

        const interviewSession = await InterviewSessionModel.create({
            jobListing: jobListing._id,
            user: user._id,
            date: new Date(),
        });

        (jwt.verify as jest.Mock).mockReturnValue({
            id: user._id,
            role: "user",
        });

        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: { interviewSession: interviewSession._id },
        });

        // Wait for connection
        await new Promise<void>((resolve) => {
            clientSocket.on("connect", () => {
                resolve();
            });
        });

        expect(clientSocket.connected).toBe(true);
    });

    it("should reject connection when no token is provided", async () => {
        clientSocket = Client(`http://localhost:${PORT}`, {});

        const error = await new Promise((resolve) => {
            clientSocket.on("connect_error", (err) => {
                resolve(err);
            });
        });

        expect(error).toEqual(new Error("No token provided"));
        expect(clientSocket.connected).toBe(false);
    });

    it("should reject connection when token is invalid", async () => {
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid token");
        });

        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "invalid-token" },
        });

        const error = await new Promise((resolve) => {
            clientSocket.on("connect_error", (err) => {
                resolve(err);
            });
        });

        expect(error).toEqual(new Error("Invalid token"));
        expect(clientSocket.connected).toBe(false);
    });

    it("should reject connection when user is not found", async () => {
        (jwt.verify as jest.Mock).mockReturnValue({
            id: new mongoose.Types.ObjectId(),
            role: "user",
        });

        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
        });

        const error = await new Promise((resolve) => {
            clientSocket.on("connect_error", (err) => {
                resolve(err);
            });
        });

        expect(error).toEqual(new Error("User not found"));
        expect(clientSocket.connected).toBe(false);
    });

    it("should reject connection when token payload is invalid", async () => {
        (jwt.verify as jest.Mock).mockReturnValue({
            role: "user", // Missing id field
        });

        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
        });

        const error = await new Promise((resolve) => {
            clientSocket.on("connect_error", (err) => {
                resolve(err);
            });
        });

        expect(error).toEqual(new Error("Invalid token payload"));
        expect(clientSocket.connected).toBe(false);
    });
});
