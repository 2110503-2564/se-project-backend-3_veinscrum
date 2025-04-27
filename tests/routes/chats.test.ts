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
import request from "supertest";

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

beforeAll(() => {
    app = initializeApp();
    const httpServer = createServer(app);
    initializeSocket(httpServer);
});

describe("Chat Routes", () => {
    beforeAll(async () => {
        // Clear all relevant collections before tests start
        await UserModel.deleteMany({});
        await CompanyModel.deleteMany({});
        await JobListingModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
        await ChatModel.deleteMany({});
    });

    afterAll(async () => {
        // Clear all relevant collections after tests finish
        await UserModel.deleteMany({});
        await CompanyModel.deleteMany({});
        await JobListingModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
        await ChatModel.deleteMany({});
    });

    beforeEach(async () => {
        // Clear mocks and only clear collections before each test
        jest.clearAllMocks();
        await UserModel.deleteMany({});
        await CompanyModel.deleteMany({});
        await JobListingModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
        await ChatModel.deleteMany({});
    });

    describe("PUT /api/v1/chats/:interviewSessionId/:messageId", () => {
        it("should allow the message sender (user) to update their message", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create company ID first
            const companyId = new mongoose.Types.ObjectId();

            // Create company owner with reference to company
            const companyOwner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "0987654321",
                role: "company",
                company: companyId,
            });

            // Create company with reference to owner
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
            const messageByUser = {
                _id: new mongoose.Types.ObjectId(),
                sender: user._id,
                content: "Hello from user",
                timestamp: new Date(),
            };
            const chat = await ChatModel.create({
                interviewSession: interviewSession._id,
                messages: [messageByUser],
            });
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });
            const updatedContent = "Updated message from user";

            const response = await request(app)
                .put(
                    `/api/v1/chats/${interviewSession._id}/${messageByUser._id}`,
                )
                .set("Authorization", "Bearer fake-jwt-token")
                .send({ content: updatedContent });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);

            // Adjust assertion based on actual controller response
            const updatedChatResponse = await ChatModel.findById(
                chat._id,
            ).lean();
            const updatedMessageInDb = updatedChatResponse?.messages.find(
                (m) => m._id.toString() === messageByUser._id.toString(),
            );
            expect(updatedMessageInDb?.content).toBe(updatedContent);

            // Verify in DB
            const updatedChat = await ChatModel.findById(chat._id);
            const updatedMessage = updatedChat?.messages.find(
                (msg) => msg._id.toString() === messageByUser._id.toString(),
            );
            expect(updatedMessage?.content).toBe(updatedContent);
        });

        it("should allow the company owner to update only their own messages in a session", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create company ID first
            const companyId = new mongoose.Types.ObjectId();

            // Create company owner with reference to company
            const companyOwner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "0987654321",
                role: "company",
                company: companyId,
            });

            // Create company with reference to owner
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

            // Create a message from the company owner
            const messageByOwner = {
                _id: new mongoose.Types.ObjectId(),
                sender: companyOwner._id,
                content: "Hello from owner",
                timestamp: new Date(),
            };
            const chat = await ChatModel.create({
                interviewSession: interviewSession._id,
                messages: [messageByOwner],
            });
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: companyOwner._id,
                role: "company",
            });
            const updatedContent = "Updated message from owner";

            const response = await request(app)
                .put(
                    `/api/v1/chats/${interviewSession._id}/${messageByOwner._id}`,
                )
                .set("Authorization", "Bearer fake-jwt-token")
                .send({ content: updatedContent });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);

            // Verify in DB
            const updatedChat = await ChatModel.findById(chat._id);
            const updatedMessage = updatedChat?.messages.find(
                (msg) => msg._id.toString() === messageByOwner._id.toString(),
            );
            expect(updatedMessage?.content).toBe(updatedContent);
        });

        it("should return 403 when company owner tries to update a message they didn't send", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create company ID first
            const companyId = new mongoose.Types.ObjectId();

            // Create company owner with reference to company
            const companyOwner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "0987654321",
                role: "company",
                company: companyId,
            });

            // Create company with reference to owner
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

            // Create a message from the user
            const messageByUser = {
                _id: new mongoose.Types.ObjectId(),
                sender: user._id,
                content: "Hello from user",
                timestamp: new Date(),
            };
            await ChatModel.create({
                interviewSession: interviewSession._id,
                messages: [messageByUser],
            });
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: companyOwner._id,
                role: "company",
            });
            const updatedContent =
                "Company owner trying to update user's message";

            const response = await request(app)
                .put(
                    `/api/v1/chats/${interviewSession._id}/${messageByUser._id}`,
                )
                .set("Authorization", "Bearer fake-jwt-token")
                .send({ content: updatedContent });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "You do not have permission to update this message",
            );
        });

        it("should return 403 if an unauthorized user tries to update a message", async () => {
            // --- Test Setup Start ---
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

            // Create company ID first
            const companyId = new mongoose.Types.ObjectId();

            // Create company owner with reference to company
            const companyOwner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "0987654321",
                role: "company",
                company: companyId,
            });

            // Create company with reference to owner
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
            const messageByUser = {
                _id: new mongoose.Types.ObjectId(),
                sender: user._id,
                content: "Hello from user",
                timestamp: new Date(),
            };
            await ChatModel.create({
                interviewSession: interviewSession._id,
                messages: [messageByUser],
            });
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: unauthorizedUser._id,
                role: "user",
            });
            const updatedContent = "Attempted update by unauthorized user";

            const response = await request(app)
                .put(
                    `/api/v1/chats/${interviewSession._id}/${messageByUser._id}`,
                )
                .set("Authorization", "Bearer fake-jwt-token")
                .send({ content: updatedContent });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "You do not have permission to update this message",
            );
        });

        it("should return 404 if interview session not found", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });
            const messageId = new mongoose.Types.ObjectId(); // A valid message ID, even if it doesn't exist in a chat yet
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });
            const nonExistentSessionId = new mongoose.Types.ObjectId();
            const updatedContent = "Updated content";

            const response = await request(app)
                .put(`/api/v1/chats/${nonExistentSessionId}/${messageId}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send({ content: updatedContent });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Chat not found");
        });

        it("should return 404 if message not found", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });
            const companyOwner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "0987654321",
                role: "company",
            });
            const company = await CompanyModel.create({
                name: "Test Company",
                owner: companyOwner._id,
                address: "123 Test St",
                website: "https://test.com",
                description: "A test company",
                tel: "5555555555",
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
            // Create chat without the message we'll try to update
            await ChatModel.create({
                interviewSession: interviewSession._id,
                messages: [],
            });
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });
            const nonExistentMessageId = new mongoose.Types.ObjectId();
            const updatedContent = "Updated content";

            const response = await request(app)
                .put(
                    `/api/v1/chats/${interviewSession._id}/${nonExistentMessageId}`,
                )
                .set("Authorization", "Bearer fake-jwt-token")
                .send({ content: updatedContent });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Message not found");
        });

        it("should return 404 if message ID is invalid", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });
            const companyOwner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "0987654321",
                role: "company",
            });
            const company = await CompanyModel.create({
                name: "Test Company",
                owner: companyOwner._id,
                address: "123 Test St",
                website: "https://test.com",
                description: "A test company",
                tel: "5555555555",
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
                chat: chatId,
                user: user._id,
                date: new Date(),
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
            const invalidMessageId = "invalid-id";
            const updatedContent = "Updated content";

            const response = await request(app)
                .put(
                    `/api/v1/chats/${interviewSession._id}/${invalidMessageId}`,
                )
                .set("Authorization", "Bearer fake-jwt-token")
                .send({ content: updatedContent });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body.error).toContain("Message not found");
        });

        it("should return 400 if interview session ID is invalid", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });
            const messageId = new mongoose.Types.ObjectId(); // A valid message ID format
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });
            const invalidSessionId = "invalid-id";
            const updatedContent = "Updated content";

            const response = await request(app)
                .put(`/api/v1/chats/${invalidSessionId}/${messageId}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send({ content: updatedContent });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body.error).toContain("Cast to ObjectId failed");
        });

        it("should return 400 if content is missing", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });
            const companyOwner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "0987654321",
                role: "company",
            });
            const company = await CompanyModel.create({
                name: "Test Company",
                owner: companyOwner._id,
                address: "123 Test St",
                website: "https://test.com",
                description: "A test company",
                tel: "5555555555",
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
            const messageByUser = {
                _id: new mongoose.Types.ObjectId(),
                sender: user._id,
                content: "Hello from user",
                timestamp: new Date(),
            };
            await ChatModel.create({
                interviewSession: interviewSession._id,
                messages: [messageByUser],
            });
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });

            const response = await request(app)
                .put(
                    `/api/v1/chats/${interviewSession._id}/${messageByUser._id}`,
                )
                .set("Authorization", "Bearer fake-jwt-token")
                .send({}); // Missing content

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Content is required",
            );
        });
    });

    describe("DELETE /api/v1/chats/:interviewSessionId/:messageId", () => {
        it("should allow the message sender (user) to delete their message", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create company ID first
            const companyId = new mongoose.Types.ObjectId();

            // Create company owner with reference to company
            const companyOwner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "0987654321",
                role: "company",
                company: companyId,
            });

            // Create company with reference to owner
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
            const messageByUser = {
                _id: new mongoose.Types.ObjectId(),
                sender: user._id,
                content: "Hello from user",
                timestamp: new Date(),
            };
            const messageByOwner = {
                _id: new mongoose.Types.ObjectId(),
                sender: companyOwner._id,
                content: "Hello from owner",
                timestamp: new Date(Date.now() + 1000),
            };
            const chat = await ChatModel.create({
                interviewSession: interviewSession._id,
                messages: [messageByUser, messageByOwner],
            });
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });

            const response = await request(app)
                .delete(
                    `/api/v1/chats/${interviewSession._id}/${messageByUser._id}`,
                )
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toEqual({}); // Expect empty object on successful delete

            // Verify in DB
            const updatedChat = await ChatModel.findById(chat._id);
            const deletedMessage = updatedChat?.messages.find(
                (msg) => msg._id.toString() === messageByUser._id.toString(),
            );
            expect(deletedMessage).toBeUndefined();
            expect(updatedChat?.messages.length).toBe(1); // Only owner's message should remain
            expect(updatedChat?.messages[0]._id.toString()).toBe(
                messageByOwner._id.toString(),
            );
        });

        it("should allow the company owner to delete only their own messages", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create company ID first
            const companyId = new mongoose.Types.ObjectId();

            // Create company owner with reference to company
            const companyOwner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "0987654321",
                role: "company",
                company: companyId,
            });

            // Create company with reference to owner
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

            const messageByUser = {
                _id: new mongoose.Types.ObjectId(),
                sender: user._id,
                content: "Hello from user",
                timestamp: new Date(),
            };
            const messageByOwner = {
                _id: new mongoose.Types.ObjectId(),
                sender: companyOwner._id,
                content: "Hello from owner",
                timestamp: new Date(Date.now() + 1000),
            };
            const chat = await ChatModel.create({
                interviewSession: interviewSession._id,
                messages: [messageByUser, messageByOwner],
            });
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: companyOwner._id,
                role: "company",
            });

            // Owner deletes their own message
            const response = await request(app)
                .delete(
                    `/api/v1/chats/${interviewSession._id}/${messageByOwner._id}`,
                )
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);

            // Verify in DB
            const updatedChat = await ChatModel.findById(chat._id);
            const deletedMessage = updatedChat?.messages.find(
                (msg) => msg._id.toString() === messageByOwner._id.toString(),
            );
            expect(deletedMessage).toBeUndefined();
            expect(updatedChat?.messages.length).toBe(1);
            expect(updatedChat?.messages[0]._id.toString()).toBe(
                messageByUser._id.toString(),
            );
        });

        it("should return 403 when company owner tries to delete a message they didn't send", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create company ID first
            const companyId = new mongoose.Types.ObjectId();

            // Create company owner with reference to company
            const companyOwner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "0987654321",
                role: "company",
                company: companyId,
            });

            // Create company with reference to owner
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

            const messageByUser = {
                _id: new mongoose.Types.ObjectId(),
                sender: user._id,
                content: "Hello from user",
                timestamp: new Date(),
            };
            await ChatModel.create({
                interviewSession: interviewSession._id,
                messages: [messageByUser],
            });
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: companyOwner._id,
                role: "company",
            });

            // Company owner tries to delete user's message
            const response = await request(app)
                .delete(
                    `/api/v1/chats/${interviewSession._id}/${messageByUser._id}`,
                )
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "You do not have permission to delete this message",
            );
        });

        it("should return 403 if an unauthorized user tries to delete a message", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create company ID first
            const companyId = new mongoose.Types.ObjectId();

            // Create company owner with reference to company
            const companyOwner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "0987654321",
                role: "company",
                company: companyId,
            });

            // Create company with reference to owner
            const company = await CompanyModel.create({
                _id: companyId,
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "A test company",
                tel: "5555555555",
                owner: companyOwner._id,
            });

            const unauthorizedUser = await UserModel.create({
                name: "Unauthorized User",
                email: "unauthorized@test.com",
                password: "password123",
                tel: "1112223333",
                role: "user",
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
            const messageByUser = {
                _id: new mongoose.Types.ObjectId(),
                sender: user._id,
                content: "Hello from user",
                timestamp: new Date(),
            };
            await ChatModel.create({
                interviewSession: interviewSession._id,
                messages: [messageByUser],
            });
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: unauthorizedUser._id,
                role: "user",
            });

            const response = await request(app)
                .delete(
                    `/api/v1/chats/${interviewSession._id}/${messageByUser._id}`,
                )
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            // Check specific error message based on controller logic
            // expect(response.body).toHaveProperty(
            //     "error",
            //     "You do not have permission to delete this message",
            // );
        });

        it("should return 404 if interview session not found", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });
            const messageId = new mongoose.Types.ObjectId(); // Valid message ID format
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });
            const nonExistentSessionId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(`/api/v1/chats/${nonExistentSessionId}/${messageId}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            // Check specific error message based on controller logic
            // expect(response.body).toHaveProperty(
            //     "error",
            //     "Chat not found", // Or "Interview session not found"
            // );
        });

        it("should return 404 if message not found", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });
            const companyOwner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "0987654321",
                role: "company",
            });
            const company = await CompanyModel.create({
                name: "Test Company",
                owner: companyOwner._id,
                address: "123 Test St",
                website: "https://test.com",
                description: "A test company",
                tel: "5555555555",
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
            // Create chat without the message we'll try to delete
            await ChatModel.create({
                interviewSession: interviewSession._id,
                messages: [],
            });
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });
            const nonExistentMessageId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(
                    `/api/v1/chats/${interviewSession._id}/${nonExistentMessageId}`,
                )
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Message not found");
        });

        it("should return 404 if message ID is invalid", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });
            const companyOwner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "0987654321",
                role: "company",
            });
            const company = await CompanyModel.create({
                name: "Test Company",
                owner: companyOwner._id,
                address: "123 Test St",
                website: "https://test.com",
                description: "A test company",
                tel: "5555555555",
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
                chat: chatId,
                user: user._id,
                date: new Date(),
            });
            await ChatModel.create({
                _id: chatId,
                interviewSession: interviewSession._id,
                messages: [],
            });
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });
            const invalidMessageId = "invalid-id";

            const response = await request(app)
                .delete(
                    `/api/v1/chats/${interviewSession._id}/${invalidMessageId}`,
                )
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body.error).toContain("Message not found");
        });

        it("should return 400 if interview session ID is invalid", async () => {
            // --- Test Setup Start ---
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });
            const messageId = new mongoose.Types.ObjectId(); // Valid message ID format
            // --- Test Setup End ---

            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });
            const invalidSessionId = "invalid-id";

            const response = await request(app)
                .delete(`/api/v1/chats/${invalidSessionId}/${messageId}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body.error).toContain("Cast to ObjectId failed");
        });
    });
});
