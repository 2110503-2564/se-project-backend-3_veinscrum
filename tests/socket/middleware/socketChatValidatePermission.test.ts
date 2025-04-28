import { initializeApp } from "@/app";
import { ChatModel } from "@/models/Chat";
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
const PORT = 15051;

beforeAll(() => {
    app = initializeApp();
    httpServer = createServer(app);
    initializeSocket(httpServer);
    httpServer.listen(PORT);

    process.on("unhandledRejection", (err, promise) => {
        if (!(err instanceof Error)) return;
        console.log(`Error: ${err.message}`);
        console.log("Unhandled Rejection at:", promise);
        httpServer.close(() => process.exit(1));
    });
});

afterAll(() => {
    httpServer.close();
});

describe("socketChatValidatePermission Middleware", () => {
    beforeEach(async () => {
        // Clear all collections before each test
        jest.clearAllMocks();
        await UserModel.deleteMany({});
        await CompanyModel.deleteMany({});
        await JobListingModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
        await ChatModel.deleteMany({});
    });

    afterEach(() => {
        // Close the client socket after each test
        if (clientSocket) {
            clientSocket.close();
        }
    });

    it("should connect successfully with valid token and permission", async () => {
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

        // Mock JWT verification
        (jwt.verify as jest.Mock).mockReturnValue({
            id: user._id,
            role: "user",
        });

        // Create client socket with auth token
        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: { interviewSession: interviewSession._id.toString() },
        });

        // Wait for connection
        await new Promise<void>((resolve) => {
            clientSocket.on("connect", () => {
                resolve();
            });
        });

        expect(clientSocket.connected).toBe(true);
    });

    it("should reject connection for unauthorized user", async () => {
        const user = await UserModel.create({
            name: "Test User",
            email: "user@test.com",
            password: "password123",
            tel: "1234567890",
            role: "user",
        });

        const unauthorizedUser = await UserModel.create({
            name: "Unauthorized User",
            email: "unauthorized@test.com",
            password: "password123",
            tel: "1112223333",
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

        // Mock JWT verification for unauthorized user
        (jwt.verify as jest.Mock).mockReturnValue({
            id: unauthorizedUser._id,
            role: "user",
        });

        let errorMessage: string | undefined;

        // Create client socket with unauthorized user
        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: { interviewSession: interviewSession._id.toString() },
        });

        clientSocket.on("connect_error", (error) => {
            errorMessage = error.message;
        });

        // Wait for error
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 1000);
        });

        expect(errorMessage).toBe(
            "You do not have permission to interact with this chat",
        );
        expect(clientSocket.connected).toBe(false);
    });

    it("should create a new chat if one doesn't exist", async () => {
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

        // Mock JWT verification
        (jwt.verify as jest.Mock).mockReturnValue({
            id: user._id,
            role: "user",
        });

        // Create client socket
        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: { interviewSession: interviewSession._id.toString() },
        });

        // Wait for connection
        await new Promise<void>((resolve) => {
            clientSocket.on("connect", () => {
                resolve();
            });
        });

        expect(clientSocket.connected).toBe(true);

        // Verify that a chat was created
        const updatedSession = await InterviewSessionModel.findById(
            interviewSession._id,
        );
        expect(updatedSession?.chat).toBeTruthy();

        // Verify the chat exists in the database
        const chat = await ChatModel.findById(updatedSession?.chat);
        expect(chat).toBeTruthy();
        expect(chat?.interviewSession.toString()).toBe(
            interviewSession._id.toString(),
        );
    });

    it("should connect successfully for company owner", async () => {
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

        // Mock JWT verification for company owner
        (jwt.verify as jest.Mock).mockReturnValue({
            id: companyOwner._id,
            role: "company",
        });

        // Create client socket
        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: { interviewSession: interviewSession._id.toString() },
        });

        // Wait for connection
        await new Promise<void>((resolve) => {
            clientSocket.on("connect", () => {
                resolve();
            });
        });

        expect(clientSocket.connected).toBe(true);
    });

    it("should reject connection when interview session does not exist", async () => {
        const user = await UserModel.create({
            name: "Test User",
            email: "user@test.com",
            password: "password123",
            tel: "1234567890",
            role: "user",
        });

        // Mock JWT verification
        (jwt.verify as jest.Mock).mockReturnValue({
            id: user._id,
            role: "user",
        });

        const nonExistentSessionId = new mongoose.Types.ObjectId();
        let errorMessage: string | undefined;

        // Create client socket with non-existent session ID
        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: { interviewSession: nonExistentSessionId.toString() },
        });

        clientSocket.on("connect_error", (error) => {
            errorMessage = error.message;
        });

        // Wait for error
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 1000);
        });

        expect(errorMessage).toBe("interviewSession not found");
        expect(clientSocket.connected).toBe(false);
    });

    it("should handle database errors gracefully", async () => {
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

        // Mock JWT verification
        (jwt.verify as jest.Mock).mockReturnValue({
            id: user._id,
            role: "user",
        });

        // Mock InterviewSessionModel.findById to throw an error
        jest.spyOn(InterviewSessionModel, "findById").mockImplementationOnce(
            () => {
                throw new Error("Database error");
            },
        );

        let errorMessage: string | undefined;

        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: { interviewSession: interviewSession._id.toString() },
        });

        clientSocket.on("connect_error", (error) => {
            errorMessage = error.message;
        });

        // Wait for error
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 1000);
        });

        expect(errorMessage).toBe("An unexpected error occurred.");
        expect(clientSocket.connected).toBe(false);
    });

    it("should handle race condition when creating chat", async () => {
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

        const chatId = new mongoose.Types.ObjectId();

        const interviewSession = await InterviewSessionModel.create({
            jobListing: jobListing._id,
            user: user._id,
            chat: chatId,
            date: new Date(),
        });

        const chat = await ChatModel.create({
            _id: chatId,
            interviewSession: interviewSession._id,
            message: [],
        });

        jest.spyOn(InterviewSessionModel, "findById").mockReturnValueOnce({
            populate: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValueOnce({
                    _id: interviewSession._id,
                    user: user._id,
                    chat: null,
                    jobListing: {
                        _id: jobListing._id,
                        company: {
                            _id: company._id,
                            name: company.name,
                        },
                    },
                }),
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        // Mock JWT verification
        (jwt.verify as jest.Mock).mockReturnValue({
            id: user._id,
            role: "user",
        });

        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: { interviewSession: interviewSession._id.toString() },
        });

        // Wait for connection
        await new Promise<void>((resolve) => {
            clientSocket.on("connect", () => {
                resolve();
            });
        });

        expect(clientSocket.connected).toBe(true);

        // Verify the chat in the database
        const finalSession = await InterviewSessionModel.findById(
            interviewSession._id,
        );
        expect(finalSession?.chat?.toString()).toBe(chat._id.toString());

        // Verify the duplicate chat was cleaned up
        const allChats = await ChatModel.find({
            interviewSession: interviewSession._id,
        });
        expect(allChats).toHaveLength(1);
        expect(allChats[0]._id.toString()).toBe(chat._id.toString());
    });
});
