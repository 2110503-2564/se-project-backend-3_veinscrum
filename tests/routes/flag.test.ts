import { initializeApp } from "@/app";
import { CompanyModel } from "@/models/Company";
import { FlagModel } from "@/models/Flag";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import { UserModel } from "@/models/User";
import type { Flag } from "@/types/models/Flag";
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

describe("Flag Routes", () => {
    beforeAll(async () => {
        await CompanyModel.deleteMany({});
        await UserModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
        await JobListingModel.deleteMany({});
        await FlagModel.deleteMany({});
    });

    afterAll(async () => {
        await CompanyModel.deleteMany({});
        await UserModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
        await JobListingModel.deleteMany({});
        await FlagModel.deleteMany({});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await CompanyModel.deleteMany({});
        await UserModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
        await JobListingModel.deleteMany({});
        await FlagModel.deleteMany({});
    });

    describe("GET /api/v1/job-listings/:id/flags", () => {
        it("should fetch all flags of a job listing", async () => {
            // Create a user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "1234567290",
                role: "admin",
            });

            const user1 = await UserModel.create({
                name: "Test User1",
                email: "user1@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            const user2 = await UserModel.create({
                name: "Test User2",
                email: "user1@test.com",
                password: "password123",
                tel: "1234567891",
                role: "user",
            });

            // Create test company in the database
            const company = await CompanyModel.create({
                name: "Deep Learning Systems",
                address: "123 AI Street, Tech City",
                website: "https://deeplearnsys.ai",
                description: "Specialized in deep learning solutions",
                tel: "+1 (555) 123-4567",
                owner: new mongoose.Types.ObjectId(),
            });

            const jobListing1 = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image1.jpg",
            });

            const jobListing2 = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software QA",
                description: "QA software",
                image: "https://example.com/image2.jpg",
            });

            const flags = [
                {
                    jobListing: jobListing1._id,
                    user: user1._id,
                },
                {
                    jobListing: jobListing1._id,
                    user: user2._id,
                },
                {
                    jobListing: jobListing2._id,
                    user: user1._id,
                },
            ];

            await FlagModel.create(flags);

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const response = await request(app)
                .get(`/api/v1/job-listings/${jobListing1._id}/flags`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");

            expect(response.body.data).toHaveLength(2);

            // Check for user ids in the response, order might vary
            const userIds = response.body.data.map((f: Flag) => f.user);
            console.log(userIds);
            expect(userIds).toContain(user1._id);
            expect(userIds).toContain(user2._id);

            const jobIds = response.body.data.map((f: Flag) => f.jobListing);
            expect(jobIds).toContain(jobListing1._id);
            expect(jobIds).not.toContain(jobListing2._id);
        });
    });
});
