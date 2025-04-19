import { initializeApp } from "@/app";

import { CompanyModel } from "@/models/Company";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import { UserModel } from "@/models/User";
import type { Express } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";

// Only mock JWT, not the database models
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
});

describe("Interview Sessions Routes", () => {
    beforeAll(async () => {
        await InterviewSessionModel.deleteMany({});
        await JobListingModel.deleteMany({});
        await CompanyModel.deleteMany({});
        await UserModel.deleteMany({});
    });

    afterAll(async () => {
        await InterviewSessionModel.deleteMany({});
        await JobListingModel.deleteMany({});
        await CompanyModel.deleteMany({});
        await UserModel.deleteMany({});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await InterviewSessionModel.deleteMany({});
        await JobListingModel.deleteMany({});
        await CompanyModel.deleteMany({});
        await UserModel.deleteMany({});
    });

    describe("GET /api/v1/sessions/:id", () => {
        it("should fetch an interview session by ID when requested by the user who created it", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create an interview session
            const session = await InterviewSessionModel.create({
                jobListing: jobListing._id,
                user: user._id,
                date: new Date("2022-05-10T10:00:00Z"),
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });

            const response = await request(app)
                .get(`/api/v1/sessions/${session._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toHaveProperty(
                "_id",
                session._id.toString(),
            );
            expect(response.body.data.user._id.toString()).toBe(
                user._id.toString(),
            );
        });

        it("should fetch an interview session when requested by the company owner", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create an interview session
            const session = await InterviewSessionModel.create({
                jobListing: jobListing._id,
                user: user._id,
                date: new Date("2022-05-10T10:00:00Z"),
            });

            // Mock JWT verification to return the company owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: owner._id,
                role: "company",
            });

            const response = await request(app)
                .get(`/api/v1/sessions/${session._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toHaveProperty(
                "_id",
                session._id.toString(),
            );
        });

        it("should fetch an interview session when requested by an admin", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create an interview session
            const session = await InterviewSessionModel.create({
                jobListing: jobListing._id,
                user: user._id,
                date: new Date("2022-05-10T10:00:00Z"),
            });

            // Create admin user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "9999999999",
                role: "admin",
            });

            // Mock JWT verification to return the admin's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const response = await request(app)
                .get(`/api/v1/sessions/${session._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });

        it("should return 403 when requested by an unauthorized user", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create an interview session
            const session = await InterviewSessionModel.create({
                jobListing: jobListing._id,
                user: user._id,
                date: new Date("2022-05-10T10:00:00Z"),
            });

            // Create another user who should not have access
            const unauthorizedUser = await UserModel.create({
                name: "Unauthorized User",
                email: "unauthorized@test.com",
                password: "password123",
                tel: "8888888888",
                role: "user",
            });

            // Mock JWT verification to return the unauthorized user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: unauthorizedUser._id,
                role: "user",
            });

            const response = await request(app)
                .get(`/api/v1/sessions/${session._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "You do not have permission to view this interview session",
            );
        });

        it("should return 404 if interview session not found", async () => {
            // Create admin user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "9999999999",
                role: "admin",
            });

            // Mock JWT verification to return the admin's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const nonExistingId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/v1/sessions/${nonExistingId}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                `No interview session found with id ${nonExistingId}`,
            );
        });
    });

    describe("GET /api/v1/sessions", () => {
        it("should fetch all interview sessions when requested by an admin", async () => {
            // Create users
            const user1 = await UserModel.create({
                name: "User 1",
                email: "user1@test.com",
                password: "password123",
                tel: "1111111111",
                role: "user",
            });

            const user2 = await UserModel.create({
                name: "User 2",
                email: "user2@test.com",
                password: "password123",
                tel: "2222222222",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create job listings
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create interview sessions
            await InterviewSessionModel.create([
                {
                    jobListing: jobListing._id,
                    user: user1._id,
                    date: new Date("2022-05-10T10:00:00Z"),
                },
                {
                    jobListing: jobListing._id,
                    user: user2._id,
                    date: new Date("2022-05-11T14:00:00Z"),
                },
            ]);

            // Create admin user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "9999999999",
                role: "admin",
            });

            // Mock JWT verification to return the admin's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const response = await request(app)
                .get("/api/v1/sessions")
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveLength(2);
        });

        it("should return 403 when a non-admin tries to access all sessions", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Regular User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });

            const response = await request(app)
                .get("/api/v1/sessions")
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
        });
    });

    describe("GET /api/v1/job-listings/:id/sessions", () => {
        it("should return interview sessions for a job listing when requested by admin", async () => {
            // Create admin user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "9999999999",
                role: "admin",
            });

            // Create users
            const user1 = await UserModel.create({
                name: "User 1",
                email: "user1@test.com",
                password: "password123",
                tel: "1111111111",
                role: "user",
            });

            const user2 = await UserModel.create({
                name: "User 2",
                email: "user2@test.com",
                password: "password123",
                tel: "2222222222",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create interview sessions for this job listing
            await InterviewSessionModel.create([
                {
                    jobListing: jobListing._id,
                    user: user1._id,
                    date: new Date("2022-05-10T10:00:00Z"),
                },
                {
                    jobListing: jobListing._id,
                    user: user2._id,
                    date: new Date("2022-05-11T14:00:00Z"),
                },
            ]);

            // Mock JWT verification to return the admin's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const response = await request(app)
                .get(`/api/v1/job-listings/${jobListing._id}/sessions`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0].jobListing._id.toString()).toBe(
                jobListing._id.toString(),
            );
        });

        it("should return all interview sessions for a job listing when requested by company owner", async () => {
            // Create users
            const user1 = await UserModel.create({
                name: "User 1",
                email: "user1@test.com",
                password: "password123",
                tel: "1111111111",
                role: "user",
            });

            const user2 = await UserModel.create({
                name: "User 2",
                email: "user2@test.com",
                password: "password123",
                tel: "2222222222",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create interview sessions for this job listing
            await InterviewSessionModel.create([
                {
                    jobListing: jobListing._id,
                    user: user1._id,
                    date: new Date("2022-05-10T10:00:00Z"),
                },
                {
                    jobListing: jobListing._id,
                    user: user2._id,
                    date: new Date("2022-05-11T14:00:00Z"),
                },
            ]);

            // Mock JWT verification to return company owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: owner._id,
                role: "company",
            });

            const response = await request(app)
                .get(`/api/v1/job-listings/${jobListing._id}/sessions`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data).toHaveLength(2);
        });

        it("should return 403 when regular user tries to access job listing sessions", async () => {
            // Create users
            const user1 = await UserModel.create({
                name: "User 1",
                email: "user1@test.com",
                password: "password123",
                tel: "1111111111",
                role: "user",
            });

            const user2 = await UserModel.create({
                name: "User 2",
                email: "user2@test.com",
                password: "password123",
                tel: "2222222222",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create interview sessions for this job listing
            await InterviewSessionModel.create([
                {
                    jobListing: jobListing._id,
                    user: user1._id,
                    date: new Date("2022-05-10T10:00:00Z"),
                },
                {
                    jobListing: jobListing._id,
                    user: user2._id,
                    date: new Date("2022-05-11T14:00:00Z"),
                },
            ]);

            // Mock JWT verification to return user1's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: user1._id,
                role: "user",
            });

            const response = await request(app)
                .get(`/api/v1/job-listings/${jobListing._id}/sessions`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "User role 'user' is not authorized to access this route",
            );
        });

        it("should return all sessions for a job listing without pagination", async () => {
            // Create admin user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "9999999999",
                role: "admin",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create multiple users and interview sessions
            const usersToCreate = 12; // Create more than typical pagination would show
            const users = [];

            for (let i = 0; i < usersToCreate; i++) {
                const user = await UserModel.create({
                    name: `Pagination User ${i}`,
                    email: `pagination${i}@test.com`,
                    password: "password123",
                    tel: `${1000000000 + i}`,
                    role: "user",
                });
                users.push(user);

                await InterviewSessionModel.create({
                    jobListing: jobListing._id,
                    user: user._id,
                    date: new Date(`2022-05-10T${10 + i}:00:00Z`),
                });
            }

            // Mock JWT verification to return admin's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            // Test that all sessions are returned without pagination
            const response = await request(app)
                .get(`/api/v1/job-listings/${jobListing._id}/sessions`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(usersToCreate); // All sessions should be returned
            expect(response.body).not.toHaveProperty("pagination"); // No pagination property should exist
            
            // Each session should be for the correct job listing
            for (const session of response.body.data) {
                expect(session.jobListing._id).toBe(jobListing._id.toString());
            }
        });

        it("should return 404 if job listing not found", async () => {
            // Create admin user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "9999999999",
                role: "admin",
            });

            // Mock JWT verification to return the admin's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const nonExistingId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/v1/job-listings/${nonExistingId}/sessions`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Job listing not found",
            );
        });
    });

    describe("POST /api/v1/sessions", () => {
        it("should create an interview session for a valid request", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });

            const sessionData = {
                jobListing: jobListing._id,
                date: new Date("2022-05-12T15:00:00Z"),
            };

            const response = await request(app)
                .post("/api/v1/sessions")
                .set("Authorization", "Bearer fake-jwt-token")
                .send(sessionData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toHaveProperty(
                "jobListing",
                jobListing._id.toString(),
            );
            expect(response.body.data).toHaveProperty(
                "user",
                user._id.toString(),
            );

            // Verify interview session was saved to database
            const sessionInDb = await InterviewSessionModel.findById(
                response.body.data._id,
            );
            expect(sessionInDb).not.toBeNull();
        });

        it("should reject creation if date is outside the allowed range", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner and company
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });

            const invalidSessionData = {
                jobListing: jobListing._id,
                date: new Date("2023-01-01T15:00:00Z"), // Date outside allowed range
            };

            const response = await request(app)
                .post("/api/v1/sessions")
                .set("Authorization", "Bearer fake-jwt-token")
                .send(invalidSessionData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Interview sessions can only be scheduled from May 10th to May 13th, 2022",
            );
        });

        it("should reject creation if user already has 3 sessions", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner and company
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create 3 existing sessions for the user
            await InterviewSessionModel.create([
                {
                    jobListing: jobListing._id,
                    user: user._id,
                    date: new Date("2022-05-10T10:00:00Z"),
                },
                {
                    jobListing: jobListing._id,
                    user: user._id,
                    date: new Date("2022-05-11T14:00:00Z"),
                },
                {
                    jobListing: jobListing._id,
                    user: user._id,
                    date: new Date("2022-05-12T16:00:00Z"),
                },
            ]);

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });

            const sessionData = {
                jobListing: jobListing._id,
                date: new Date("2022-05-13T15:00:00Z"),
            };

            const response = await request(app)
                .post("/api/v1/sessions")
                .set("Authorization", "Bearer fake-jwt-token")
                .send(sessionData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "You have reached the maximum number of interview sessions",
            );
        });

        it("should allow admin to create more than 3 sessions", async () => {
            // Create admin user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "9999999999",
                role: "admin",
            });

            // Create a company owner and company
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create 3 existing sessions for the admin
            await InterviewSessionModel.create([
                {
                    jobListing: jobListing._id,
                    user: admin._id,
                    date: new Date("2022-05-10T10:00:00Z"),
                },
                {
                    jobListing: jobListing._id,
                    user: admin._id,
                    date: new Date("2022-05-11T14:00:00Z"),
                },
                {
                    jobListing: jobListing._id,
                    user: admin._id,
                    date: new Date("2022-05-12T16:00:00Z"),
                },
            ]);

            // Mock JWT verification to return the admin's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const sessionData = {
                jobListing: jobListing._id,
                date: new Date("2022-05-13T15:00:00Z"),
            };

            const response = await request(app)
                .post("/api/v1/sessions")
                .set("Authorization", "Bearer fake-jwt-token")
                .send(sessionData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("success", true);
        });

        it("should return 404 if job listing not found", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });

            const nonExistingId = new mongoose.Types.ObjectId();
            const sessionData = {
                jobListing: nonExistingId,
                date: new Date("2022-05-12T15:00:00Z"),
            };

            const response = await request(app)
                .post("/api/v1/sessions")
                .set("Authorization", "Bearer fake-jwt-token")
                .send(sessionData);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Job listing not found",
            );
        });
    });

    describe("PUT /api/v1/sessions/:id", () => {
        it("should update an interview session when requested by the user who created it", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create an interview session
            const session = await InterviewSessionModel.create({
                jobListing: jobListing._id,
                user: user._id,
                date: new Date("2022-05-10T10:00:00Z"),
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });

            const updateData = {
                date: new Date("2022-05-11T14:00:00Z"),
            };

            const response = await request(app)
                .put(`/api/v1/sessions/${session._id}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(new Date(response.body.data.date).toISOString()).toBe(
                new Date("2022-05-11T14:00:00Z").toISOString(),
            );

            // Verify session was updated in database
            const updatedSession = await InterviewSessionModel.findById(
                session._id,
            );

            expect(updatedSession).toBeDefined();

            if (!updatedSession) {
                throw new Error("Unreachable");
            }

            expect(new Date(updatedSession.date).toISOString()).toBe(
                new Date("2022-05-11T14:00:00Z").toISOString(),
            );
        });

        it("should update an interview session when requested by the company owner", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create an interview session
            const session = await InterviewSessionModel.create({
                jobListing: jobListing._id,
                user: user._id,
                date: new Date("2022-05-10T10:00:00Z"),
            });

            // Mock JWT verification to return the company owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: owner._id,
                role: "company",
            });

            const updateData = {
                date: new Date("2022-05-11T14:00:00Z"),
            };

            const response = await request(app)
                .put(`/api/v1/sessions/${session._id}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });

        it("should reject updates if date is outside allowed range", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create an interview session
            const session = await InterviewSessionModel.create({
                jobListing: jobListing._id,
                user: user._id,
                date: new Date("2022-05-10T10:00:00Z"),
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });

            const invalidUpdateData = {
                date: new Date("2023-01-01T14:00:00Z"), // Date outside allowed range
            };

            const response = await request(app)
                .put(`/api/v1/sessions/${session._id}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(invalidUpdateData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Interview sessions can only be scheduled from May 10th to May 13th, 2022",
            );
        });

        it("should return 403 when requested by an unauthorized user", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create an interview session
            const session = await InterviewSessionModel.create({
                jobListing: jobListing._id,
                user: user._id,
                date: new Date("2022-05-10T10:00:00Z"),
            });

            // Create another user who should not have access
            const unauthorizedUser = await UserModel.create({
                name: "Unauthorized User",
                email: "unauthorized@test.com",
                password: "password123",
                tel: "8888888888",
                role: "user",
            });

            // Mock JWT verification to return the unauthorized user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: unauthorizedUser._id,
                role: "user",
            });

            const updateData = {
                date: new Date("2022-05-11T14:00:00Z"),
            };

            const response = await request(app)
                .put(`/api/v1/sessions/${session._id}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "You do not have permission to update this interview session",
            );
        });

        it("should return 404 if session not found", async () => {
            // Create admin user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "9999999999",
                role: "admin",
            });

            // Mock JWT verification to return the admin's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const nonExistingId = new mongoose.Types.ObjectId();
            const updateData = {
                date: new Date("2022-05-11T14:00:00Z"),
            };

            const response = await request(app)
                .put(`/api/v1/sessions/${nonExistingId}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Interview session not found",
            );
        });
    });

    describe("DELETE /api/v1/sessions/:id", () => {
        it("should delete an interview session when requested by the user who created it", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create an interview session
            const session = await InterviewSessionModel.create({
                jobListing: jobListing._id,
                user: user._id,
                date: new Date("2022-05-10T10:00:00Z"),
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });

            const response = await request(app)
                .delete(`/api/v1/sessions/${session._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);

            // Verify session was deleted from database
            const deletedSession = await InterviewSessionModel.findById(
                session._id,
            );
            expect(deletedSession).toBeNull();
        });

        it("should delete an interview session when requested by the company owner", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create an interview session
            const session = await InterviewSessionModel.create({
                jobListing: jobListing._id,
                user: user._id,
                date: new Date("2022-05-10T10:00:00Z"),
            });

            // Mock JWT verification to return the company owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: owner._id,
                role: "company",
            });

            const response = await request(app)
                .delete(`/api/v1/sessions/${session._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);

            // Verify session was deleted from database
            const deletedSession = await InterviewSessionModel.findById(
                session._id,
            );
            expect(deletedSession).toBeNull();
        });

        it("should return 403 when requested by an unauthorized user", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Test User",
                email: "user@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Create an interview session
            const session = await InterviewSessionModel.create({
                jobListing: jobListing._id,
                user: user._id,
                date: new Date("2022-05-10T10:00:00Z"),
            });

            // Create another user who should not have access
            const unauthorizedUser = await UserModel.create({
                name: "Unauthorized User",
                email: "unauthorized@test.com",
                password: "password123",
                tel: "8888888888",
                role: "user",
            });

            // Mock JWT verification to return the unauthorized user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: unauthorizedUser._id,
                role: "user",
            });

            const response = await request(app)
                .delete(`/api/v1/sessions/${session._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "You do not have permission to delete this interview session",
            );

            // Verify session was not deleted
            const sessionStillExists = await InterviewSessionModel.findById(
                session._id,
            );
            expect(sessionStillExists).not.toBeNull();
        });

        it("should return 404 if session not found", async () => {
            // Create admin user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "9999999999",
                role: "admin",
            });

            // Mock JWT verification to return the admin's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const nonExistingId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .delete(`/api/v1/sessions/${nonExistingId}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Interview session not found",
            );
        });
    });

    describe("Integration test - Interview session lifecycle", () => {
        it("should create, update, and delete an interview session with verification", async () => {
            // Create a user
            const user = await UserModel.create({
                name: "Lifecycle User",
                email: "lifecycle@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create a company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: owner._id,
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: user._id,
                role: "user",
            });

            // PHASE 1: Create interview session
            const sessionData = {
                jobListing: jobListing._id,
                date: new Date("2022-05-12T15:00:00Z"),
            };

            const createResponse = await request(app)
                .post("/api/v1/sessions")
                .set("Authorization", "Bearer fake-jwt-token")
                .send(sessionData);

            expect(createResponse.status).toBe(201);
            expect(createResponse.body.data).toHaveProperty(
                "jobListing",
                jobListing._id.toString(),
            );

            const sessionId = createResponse.body.data._id;

            // PHASE 2: Update interview session
            const updateData = {
                date: new Date("2022-05-13T10:00:00Z"),
            };

            const updateResponse = await request(app)
                .put(`/api/v1/sessions/${sessionId}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(updateResponse.status).toBe(200);
            expect(new Date(updateResponse.body.data.date).toISOString()).toBe(
                new Date("2022-05-13T10:00:00Z").toISOString(),
            );

            // PHASE 3: Delete interview session
            const deleteResponse = await request(app)
                .delete(`/api/v1/sessions/${sessionId}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(deleteResponse.status).toBe(200);

            // Verify session is gone
            const verifyResponse = await request(app)
                .get(`/api/v1/sessions/${sessionId}`)
                .set("Authorization", "Bearer fake-jwt-token");
            expect(verifyResponse.status).toBe(404);
        });
    });
});
