import { initializeApp } from "@/app";
import { ChatSocketEvent } from "@/constants/ChatSocketEvent";
import { ChatModel } from "@/models/Chat";
import { CompanyModel } from "@/models/Company";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import { UserModel } from "@/models/User";
import { initializeSocket } from "@/socket/socket";
import { Message } from "@/types/models/Message";
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
const PORT = 15050;

beforeAll(() => {
    app = initializeApp();
    httpServer = createServer(app);
    initializeSocket(httpServer);
    httpServer.listen(PORT, () => {
        console.log(
            `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
        );
    });

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

describe("Socket Connection", () => {
    beforeEach(async () => {
        // Clear all mocks and collections before each test
        jest.clearAllMocks();
        await UserModel.deleteMany({});
        await CompanyModel.deleteMany({});
        await JobListingModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
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

    it("should reject connection without token", async () => {
        // Create client socket without auth token
        clientSocket = Client(`http://localhost:${PORT}`, {
            query: {
                interviewSession: new mongoose.Types.ObjectId().toString(),
            },
        });

        // Wait for connect_error event
        const error = await new Promise((resolve) => {
            clientSocket.on("connect_error", (err) => {
                resolve(err);
            });
        });

        expect(error).toBeTruthy();
        expect(clientSocket.connected).toBe(false);
    });

    it("should reject connection for non-existent interview session", async () => {
        const user = await UserModel.create({
            name: "Test User",
            email: "user@test.com",
            password: "password123",
            tel: "1234567890",
            role: "user",
        });

        (jwt.verify as jest.Mock).mockReturnValue({
            id: user._id,
            role: "user",
        });

        // Create client socket with non-existent interview session
        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: {
                interviewSession: new mongoose.Types.ObjectId().toString(),
            },
        });

        // Wait for disconnect event
        await new Promise<void>((resolve) => {
            clientSocket.on("connect_error", () => {
                resolve();
            });
        });

        expect(clientSocket.connected).toBe(false);
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

        // Create client socket with unauthorized user
        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: { interviewSession: interviewSession._id.toString() },
        });

        const error = await new Promise((resolve) => {
            clientSocket.on("connect_error", (err) => {
                resolve(err);
            });
        });

        expect(error).toEqual(
            new Error("You do not have permission to interact with this chat"),
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

        // Create interview session without a chat
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
    });

    it("should handle chat not found scenario", async () => {
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
            chat: new mongoose.Types.ObjectId(), // Invalid chat ID
        });

        (jwt.verify as jest.Mock).mockReturnValue({
            id: user._id,
            role: "user",
        });

        let errorMessage: string | undefined;
        let disconnected = false;

        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: { interviewSession: interviewSession._id.toString() },
        });

        clientSocket.on("chat-error", (error: { error: string }) => {
            errorMessage = error.error;
        });

        clientSocket.on("disconnect", () => {
            disconnected = true;
        });

        await new Promise<void>((resolve) => {
            setTimeout(resolve, 1000);
        });

        expect(errorMessage).toBe("Chat not found");
        expect(disconnected).toBe(true);
    });

    it("should handle message event error", async () => {
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

        let errorMessage: string | undefined;

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

        // Mock ChatModel.findByIdAndUpdate to throw an error
        jest.spyOn(mongoose.Model, "findByIdAndUpdate").mockRejectedValueOnce(
            new Error("Database error"),
        );

        clientSocket.on("chat-error", (error: { error: string }) => {
            errorMessage = error.error;
        });

        // Send a message that will trigger an error
        clientSocket.emit("chat-message", "Test message");

        // Wait for error response
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 1000);
        });

        expect(errorMessage).toBe(
            "Failed to process the message. Please try again.",
        );
    });

    it("should handle successful message sending", async () => {
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
            date: new Date(),
            chat: chatId,
        });

        await ChatModel.create({
            _id: chatId,
            interviewSession: interviewSession._id,
            messages: [],
        });

        (jwt.verify as jest.Mock).mockReturnValue({
            id: user._id,
            role: "user",
        });

        let receivedMessage: Message | undefined = undefined;
        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: { interviewSession: interviewSession._id.toString() },
        });

        // Wait for connection and message history
        await new Promise<void>((resolve) => {
            clientSocket.on(ChatSocketEvent.ChatHistory, () => {
                resolve();
            });
        });

        // Set up listener for new messages
        clientSocket.on(ChatSocketEvent.ChatMessage, (msg: Message) => {
            receivedMessage = msg;
        });

        // Send a message
        const testMessage = "Hello, this is a test message!";
        clientSocket.emit(ChatSocketEvent.ChatMessage, testMessage);

        // Wait for message to be processed
        await new Promise((resolve) => setTimeout(resolve, 1000));

        expect(receivedMessage).toBeDefined();
        expect(receivedMessage!.content).toBe(testMessage);
        expect(receivedMessage!.sender._id.toString()).toBe(
            user._id.toString(),
        );

        // Verify message was saved to database
        const updatedChat = await ChatModel.findById(chatId);
        expect(updatedChat?.messages).toHaveLength(1);
        expect(updatedChat?.messages[0].content).toBe(testMessage);
    });

    it("should handle connection error gracefully", async () => {
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

        // Mock ChatModel.findById to throw an error
        jest.spyOn(ChatModel, "findById").mockImplementationOnce(() => {
            throw new Error("Database error");
        });

        let errorMessage: string | undefined;
        let disconnected = false;

        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: {
                interviewSession: interviewSession._id,
            },
        });

        clientSocket.on(
            ChatSocketEvent.ChatError,
            (error: { error: string }) => {
                errorMessage = error.error;
            },
        );

        clientSocket.on("disconnect", () => {
            disconnected = true;
        });

        await new Promise<void>((resolve) => {
            setTimeout(resolve, 1000);
        });

        expect(errorMessage).toBe(
            "An unexpected error occurred. Please try again later.",
        );
        expect(disconnected).toBe(true);
    });

    it("should not process empty or whitespace-only messages", async () => {
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
            date: new Date(),
            chat: chatId,
        });

        await ChatModel.create({
            _id: chatId,
            interviewSession: interviewSession._id,
            messages: [],
        });

        (jwt.verify as jest.Mock).mockReturnValue({
            id: user._id,
            role: "user",
        });

        let messageReceived = false;
        clientSocket = Client(`http://localhost:${PORT}`, {
            auth: { token: "valid-token" },
            query: { interviewSession: interviewSession._id.toString() },
        });

        // Wait for connection and message history
        await new Promise<void>((resolve) => {
            clientSocket.on(ChatSocketEvent.ChatHistory, () => {
                resolve();
            });
        });

        // Set up listener for new messages
        clientSocket.on(ChatSocketEvent.ChatMessage, () => {
            messageReceived = true;
        });

        // Send empty and whitespace-only messages
        clientSocket.emit(ChatSocketEvent.ChatMessage, "");
        clientSocket.emit(ChatSocketEvent.ChatMessage, "   ");
        clientSocket.emit(ChatSocketEvent.ChatMessage, "\n\t");

        // Wait a bit to ensure no messages are processed
        await new Promise((resolve) => setTimeout(resolve, 1000));

        expect(messageReceived).toBe(false);

        // Verify no messages were saved to database
        const updatedChat = await ChatModel.findById(chatId);
        expect(updatedChat?.messages).toHaveLength(0);
    });
});
