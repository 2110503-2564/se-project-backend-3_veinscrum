import { initializeApp } from "@/app";
import { CompanyModel } from "@/models/Company";
import { FlagModel } from "@/models/Flag";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import { UserModel } from "@/models/User";
import type { Flag } from "@/types/models/Flag";
import type { User } from "@/types/models/User";
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
            const users = response.body.data.map((f: Flag) => f.user);
            const userIds = users.map((u: User) => u._id);
            expect(userIds).toContain<string>(user1._id.toString());
            expect(userIds).toContain<string>(user2._id.toString());

            const jobIds = response.body.data.map((f: Flag) => f.jobListing);
            expect(jobIds).toContain<string>(jobListing1._id.toString());
            expect(jobIds).not.toContain<string>(jobListing2._id.toString());
        });

        it("should 404 if job listing not found", async () => {
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
                .get(
                    `/api/v1/job-listings/${new mongoose.Types.ObjectId()}/flags`,
                )
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Job listing not found",
            );
        });

        it("should 403 if company view other company flag", async () => {
            // Create a user
            const company1 = await UserModel.create({
                name: "Company1 User",
                email: "company1@test.com",
                password: "password123",
                tel: "1234517290",
                role: "company",
            });

            const company2 = await UserModel.create({
                name: "Company2 User",
                email: "company2@test.com",
                password: "password123",
                tel: "1234517240",
                role: "company",
            });

            const user1 = await UserModel.create({
                name: "Test User1",
                email: "user1@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create test company in the database
            const company = await CompanyModel.create({
                name: "Deep Learning Systems",
                address: "123 AI Street, Tech City",
                website: "https://deeplearnsys.ai",
                description: "Specialized in deep learning solutions",
                tel: "+1 (555) 123-4567",
                owner: company2._id,
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
                    jobListing: jobListing2._id,
                    user: user1._id,
                },
            ];

            await FlagModel.create(flags);

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: company1._id,
                role: "company",
            });

            const response = await request(app)
                .get(`/api/v1/job-listings/${jobListing1._id}/flags`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "You do not have permission to view this job listing flag",
            );
        });

        it("should 500 unexpected error (mock catch)", async () => {
            // Create a user
            const company1 = await UserModel.create({
                name: "Company1 User",
                email: "company1@test.com",
                password: "password123",
                tel: "1234517290",
                role: "company",
            });

            const company2 = await UserModel.create({
                name: "Company2 User",
                email: "company2@test.com",
                password: "password123",
                tel: "1234517240",
                role: "company",
            });

            const user1 = await UserModel.create({
                name: "Test User1",
                email: "user1@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create test company in the database
            const company = await CompanyModel.create({
                name: "Deep Learning Systems",
                address: "123 AI Street, Tech City",
                website: "https://deeplearnsys.ai",
                description: "Specialized in deep learning solutions",
                tel: "+1 (555) 123-4567",
                owner: company2._id,
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
                    jobListing: jobListing2._id,
                    user: user1._id,
                },
            ];

            await FlagModel.create(flags);

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: company1._id,
                role: "company",
            });

            jest.spyOn(JobListingModel, "findById").mockImplementation(() => {
                throw new Error("Mock error");
            });

            const response = await request(app)
                .get(`/api/v1/job-listings/${jobListing1._id}/flags`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Mock error");
        });
    });

    describe("POST /api/v1/flags", () => {
        it("should create new flag", async () => {
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

            const flagData = {
                jobListing: jobListing1._id,
                user: user1._id,
            };

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const response = await request(app)
                .post(`/api/v1/flags`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(flagData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty(
                "jobListing",
                jobListing1._id.toString(),
            );
            expect(response.body.data).toHaveProperty(
                "user",
                user1._id.toString(),
            );
        });

        it("should 404 user not found", async () => {
            // Create a user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "1234567290",
                role: "admin",
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

            const flagData = {
                jobListing: jobListing1._id,
                user: new mongoose.Types.ObjectId(),
            };

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const response = await request(app)
                .post(`/api/v1/flags`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(flagData);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "User not found");
        });

        it("should 404 no job listing", async () => {
            // Create users
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

            const flagData = {
                jobListing: new mongoose.Types.ObjectId(),
                user: user1._id,
            };

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const response = await request(app)
                .post(`/api/v1/flags`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(flagData);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Job listing not found",
            );
        });

        it("should 400 flag already existed", async () => {
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

            const flagData = {
                jobListing: jobListing1._id,
                user: user1._id,
            };

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            await request(app)
                .post(`/api/v1/flags`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(flagData);

            const response = await request(app)
                .post(`/api/v1/flags`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(flagData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Flag already existed",
            );
        });

        it("should 500 unexpected error (mock catch)", async () => {
            // Create a user
            const company1 = await UserModel.create({
                name: "Company1 User",
                email: "company1@test.com",
                password: "password123",
                tel: "1234517290",
                role: "company",
            });

            const company2 = await UserModel.create({
                name: "Company2 User",
                email: "company2@test.com",
                password: "password123",
                tel: "1234517240",
                role: "company",
            });

            const user1 = await UserModel.create({
                name: "Test User1",
                email: "user1@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create test company in the database
            const company = await CompanyModel.create({
                name: "Deep Learning Systems",
                address: "123 AI Street, Tech City",
                website: "https://deeplearnsys.ai",
                description: "Specialized in deep learning solutions",
                tel: "+1 (555) 123-4567",
                owner: company2._id,
            });

            const jobListing1 = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image1.jpg",
            });

            const flagData = {
                jobListing: jobListing1._id,
                user: user1._id,
            };

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: company1._id,
                role: "company",
            });

            jest.spyOn(JobListingModel, "findById").mockImplementation(() => {
                throw new Error("Mock error");
            });

            const response = await request(app)
                .post(`/api/v1/flags`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(flagData);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Mock error");
        });
    });

    describe("DELETE /api/v1/flags/:id", () => {
        it("should delete a flag", async () => {
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

            const flag = await FlagModel.create({
                jobListing: jobListing1._id,
                user: user1._id,
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const response = await request(app)
                .delete(`/api/v1/flags/${flag._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data", {});

            const retrive = await FlagModel.findById(flag._id);
            expect(retrive).toBeNull();
        });

        it("should 404 flag not found", async () => {
            // Create a user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "1234567290",
                role: "admin",
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const response = await request(app)
                .delete(`/api/v1/flags/${new mongoose.Types.ObjectId()}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Flag not found");
        });

        it("should 403 if company delete other company flag", async () => {
            // Create users
            const company1 = await UserModel.create({
                name: "Company1 User",
                email: "company1@test.com",
                password: "password123",
                tel: "1222567290",
                role: "company",
            });

            const company2 = await UserModel.create({
                name: "Company2 User",
                email: "company2@test.com",
                password: "password123",
                tel: "0123456789",
                role: "company",
            });

            const user1 = await UserModel.create({
                name: "Test User1",
                email: "user1@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create test company in the database
            const company = await CompanyModel.create({
                name: "Deep Learning Systems",
                address: "123 AI Street, Tech City",
                website: "https://deeplearnsys.ai",
                description: "Specialized in deep learning solutions",
                tel: "+1 (555) 123-4567",
                owner: company2._id,
            });

            const jobListing1 = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image1.jpg",
            });

            const flag = await FlagModel.create({
                jobListing: jobListing1._id,
                user: user1._id,
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: company1._id,
                role: "company",
            });

            const response = await request(app)
                .delete(`/api/v1/flags/${flag._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "You do not have permission to delete this flag",
            );
        });

        it("should 404 if job listing don't exist", async () => {
            // Create users
            const company1 = await UserModel.create({
                name: "Company1 User",
                email: "company1@test.com",
                password: "password123",
                tel: "1222567290",
                role: "company",
            });

            const company2 = await UserModel.create({
                name: "Company2 User",
                email: "company2@test.com",
                password: "password123",
                tel: "0123456789",
                role: "company",
            });

            const user1 = await UserModel.create({
                name: "Test User1",
                email: "user1@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create test company in the database
            const company = await CompanyModel.create({
                name: "Deep Learning Systems",
                address: "123 AI Street, Tech City",
                website: "https://deeplearnsys.ai",
                description: "Specialized in deep learning solutions",
                tel: "+1 (555) 123-4567",
                owner: company2._id,
            });

            const flag = await FlagModel.create({
                jobListing: new mongoose.Types.ObjectId(),
                user: user1._id,
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: company1._id,
                role: "company",
            });

            const response = await request(app)
                .delete(`/api/v1/flags/${flag._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Job listing not found",
            );
        });

        it("should 500 unexpected error (mock catch)", async () => {
            // Create a user
            const company1 = await UserModel.create({
                name: "Company1 User",
                email: "company1@test.com",
                password: "password123",
                tel: "1234517290",
                role: "company",
            });

            const company2 = await UserModel.create({
                name: "Company2 User",
                email: "company2@test.com",
                password: "password123",
                tel: "1234517240",
                role: "company",
            });

            const user1 = await UserModel.create({
                name: "Test User1",
                email: "user1@test.com",
                password: "password123",
                tel: "1234567890",
                role: "user",
            });

            // Create test company in the database
            const company = await CompanyModel.create({
                name: "Deep Learning Systems",
                address: "123 AI Street, Tech City",
                website: "https://deeplearnsys.ai",
                description: "Specialized in deep learning solutions",
                tel: "+1 (555) 123-4567",
                owner: company2._id,
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

            const flag = await FlagModel.create({
                jobListing: jobListing1._id,
                user: user1._id,
            });

            // Mock JWT verification to return the user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: company1._id,
                role: "company",
            });

            jest.spyOn(JobListingModel, "findById").mockImplementation(() => {
                throw new Error("Mock error");
            });

            const response = await request(app)
                .delete(`/api/v1/flags/${flag._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Mock error");
        });
    });
});
