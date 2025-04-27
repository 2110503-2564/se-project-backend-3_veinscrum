import { initializeApp } from "@/app";
import { CompanyModel } from "@/models/Company";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import { UserModel } from "@/models/User";
import type { Company } from "@/types/models/Company";
import type { JobListing } from "@/types/models/JobListing";
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

describe("Job Listings Routes", () => {
    beforeAll(async () => {
        await JobListingModel.deleteMany({});
        await CompanyModel.deleteMany({});
        await UserModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
    });

    afterAll(async () => {
        await JobListingModel.deleteMany({});
        await CompanyModel.deleteMany({});
        await UserModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await JobListingModel.deleteMany({});
        await CompanyModel.deleteMany({});
        await UserModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
    });

    describe("GET /api/v1/job-listings/:id", () => {
        it("should fetch a job listing by ID", async () => {
            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: new mongoose.Types.ObjectId(),
            });

            // Create a job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Develop software",
                image: "https://example.com/image.jpg",
            });

            const response = await request(app).get(
                `/api/v1/job-listings/${jobListing._id}`,
            );

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toHaveProperty(
                "jobTitle",
                "Software Engineer",
            );
            expect(response.body.data._id.toString()).toBe(
                jobListing._id.toString(),
            );
        });

        it("should return 404 if job listing not found", async () => {
            const nonExistingId = new mongoose.Types.ObjectId();
            const response = await request(app).get(
                `/api/v1/job-listings/${nonExistingId}`,
            );

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Job listing not found",
            );
        });

        it("should return 500 (mock catch condition)", async () => {
            jest.spyOn(JobListingModel, "findById").mockImplementation(() => {
                throw new Error("Mock unexpected error");
            });

            const nonExistingId = new mongoose.Types.ObjectId();
            const response = await request(app).get(
                `/api/v1/job-listings/${nonExistingId}`,
            );

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Mock unexpected error",
            );
        });
    });

    describe("GET /api/v1/job-listings", () => {
        it("should fetch all job listings with pagination", async () => {
            // Create admin user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "5555555555",
                role: "admin",
            });

            // Create a company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://test.com",
                description: "Test description",
                tel: "1234567890",
                owner: admin._id,
            });

            // Create test job listings
            await JobListingModel.create([
                {
                    company: company._id,
                    jobTitle: "Frontend Developer",
                    description: "Build UIs",
                    image: "https://example.com/frontend.jpg",
                },
                {
                    company: company._id,
                    jobTitle: "Backend Developer",
                    description: "Build APIs",
                    image: "https://example.com/backend.jpg",
                },
                {
                    company: company._id,
                    jobTitle: "DevOps Engineer",
                    description: "Manage infrastructure",
                    image: "https://example.com/devops.jpg",
                },
                {
                    company: company._id,
                    jobTitle: "QA Engineer",
                    description: "Test software",
                    image: "https://example.com/qa.jpg",
                },
                {
                    company: company._id,
                    jobTitle: "Product Manager",
                    description: "Manage products",
                    image: "https://example.com/pm.jpg",
                },
            ]);

            // Mock JWT verification to return the owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            // Test with default pagination (page 1, limit 25)
            const response = await request(app)
                .get("/api/v1/job-listings")
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("count", 5);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveLength(5);
            expect(response.body).not.toHaveProperty("pagination.next");
            expect(response.body).not.toHaveProperty("pagination.prev");

            // Test with custom pagination (page 1, limit 2)
            const responseWithLimit = await request(app)
                .get("/api/v1/job-listings?page=1&limit=2")
                .set("Authorization", "Bearer fake-jwt-token");

            expect(responseWithLimit.status).toBe(200);
            expect(responseWithLimit.body).toHaveProperty("success", true);
            expect(responseWithLimit.body).toHaveProperty("count", 2);
            expect(responseWithLimit.body.data).toHaveLength(2);
            expect(responseWithLimit.body).toHaveProperty("pagination.next");
            expect(responseWithLimit.body).not.toHaveProperty(
                "pagination.prev",
            );

            // Test with custom pagination (page 2, limit 2)
            const responsePage2 = await request(app)
                .get("/api/v1/job-listings?page=2&limit=2")
                .set("Authorization", "Bearer fake-jwt-token");

            expect(responsePage2.status).toBe(200);
            expect(responsePage2.body).toHaveProperty("success", true);
            expect(responsePage2.body).toHaveProperty("count", 2);
            expect(responsePage2.body.data).toHaveLength(2);
            expect(responsePage2.body).toHaveProperty("pagination.prev");
            expect(responsePage2.body).toHaveProperty("pagination.next");

            // Test with custom pagination (page 3, limit 2)
            const responsePage3 = await request(app)
                .get("/api/v1/job-listings?page=3&limit=2")
                .set("Authorization", "Bearer fake-jwt-token");

            expect(responsePage3.status).toBe(200);
            expect(responsePage3.body).toHaveProperty("success", true);
            expect(responsePage3.body).toHaveProperty("count", 1);
            expect(responsePage3.body.data).toHaveLength(1);
            expect(responsePage3.body).toHaveProperty("pagination.prev");
            expect(responsePage3.body).not.toHaveProperty("pagination.next");
        });

        it("should return 500 (mock catch condition)", async () => {
            // Create owner and company
            const admin = await UserModel.create({
                name: "Admin",
                email: "admin@test.com",
                password: "password123",
                tel: "1234567890",
                role: "admin",
            });

            // Mock JWT verification to return the owner's ID with company role
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            jest.spyOn(JobListingModel, "find").mockImplementation(() => {
                throw new Error("Mock unexpected error");
            });

            const response = await request(app)
                .get("/api/v1/job-listings")
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Mock unexpected error",
            );
        });
    });

    describe("GET /api/v1/companies/:id/job-listings", () => {
        it("should fetch job listings by company", async () => {
            // Create company user
            const companyUser = await UserModel.create({
                name: "Company User",
                email: "company@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create companies
            const company1 = await CompanyModel.create({
                name: "Company A",
                address: "123 A St",
                website: "https://companya.com",
                description: "Company A description",
                tel: "1111111111",
                owner: companyUser._id,
            });

            const company2 = await CompanyModel.create({
                name: "Company B",
                address: "456 B St",
                website: "https://companyb.com",
                description: "Company B description",
                tel: "2222222222",
                owner: new mongoose.Types.ObjectId(), // random user
            });

            // Create job listings for different companies
            await JobListingModel.create([
                {
                    company: company1._id,
                    jobTitle: "Role at Company A",
                    description: "Work at A",
                    image: "https://example.com/a.jpg",
                },
                {
                    company: company1._id,
                    jobTitle: "Another Role at Company A",
                    description: "Also work at A",
                    image: "https://example.com/a2.jpg",
                },
                {
                    company: company2._id,
                    jobTitle: "Role at Company B",
                    description: "Work at B",
                    image: "https://example.com/b.jpg",
                },
            ]);
            // Mock JWT verification to return the owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({ id: companyUser._id });

            const response = await request(app)
                .get(`/api/v1/companies/${company1._id}/job-listings`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveLength(2);

            // Both job listings should be from company1
            for (const jobListing of response.body.data) {
                expect(
                    String(
                        (
                            jobListing as unknown as JobListing & {
                                company: Company;
                            }
                        ).company._id,
                    ),
                ).toBe(String(company1._id));
            }
        });

        it("should return 404 when company not found", async () => {
            // Create company user
            const companyUser = await UserModel.create({
                name: "Company User",
                email: "company@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Mock JWT verification to return the owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({ id: companyUser._id });

            const response = await request(app)
                .get(
                    `/api/v1/companies/${new mongoose.Types.ObjectId()}/job-listings`,
                )
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Company not found");
        });

        it("should return 403 when company requested other company", async () => {
            // Create company user
            const companyUser = await UserModel.create({
                name: "Company User",
                email: "company@test.com",
                password: "password123",
                tel: "5555555555",
                role: "company",
            });

            // Create companies
            const company1 = await CompanyModel.create({
                name: "Company A",
                address: "123 A St",
                website: "https://companya.com",
                description: "Company A description",
                tel: "1111111111",
                owner: companyUser._id,
            });

            const company2 = await CompanyModel.create({
                name: "Company B",
                address: "456 B St",
                website: "https://companyb.com",
                description: "Company B description",
                tel: "2222222222",
                owner: new mongoose.Types.ObjectId(), // random user
            });

            // Create job listings for different companies
            await JobListingModel.create([
                {
                    company: company1._id,
                    jobTitle: "Role at Company A",
                    description: "Work at A",
                    image: "https://example.com/a.jpg",
                },
            ]);
            // Mock JWT verification to return the owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({ id: companyUser._id });

            const response = await request(app)
                .get(`/api/v1/companies/${company2._id}/job-listings`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "You do not have permission to view this company job listings",
            );
        });

        it("should return 400 when object id is invalid (catch)", async () => {
            // Create owner and company
            const owner = await UserModel.create({
                name: "Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            // Mock JWT verification to return the owner's ID with company role
            (jwt.verify as jest.Mock).mockReturnValue({
                id: owner._id,
                role: "company",
            });

            const response = await request(app)
                .get(`/api/v1/companies/NOT_OBJECT_ID/job-listings`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                'Mongoose Error: Cast to ObjectId failed for value "NOT_OBJECT_ID" (type string) at path "_id" for model "Company"',
            );
        });
    });

    describe("POST /api/v1/job-listings", () => {
        it("should create a job listing", async () => {
            // Create a company and owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@company.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            const company = await CompanyModel.create({
                name: "Owner's Company",
                address: "123 Owner St",
                website: "https://ownerscompany.com",
                description: "Owner's company description",
                tel: "9876543210",
                owner: owner._id,
            });

            // Update owner with company reference
            await UserModel.findByIdAndUpdate(owner._id, {
                company: company._id,
            });

            // Mock JWT verification to return the owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({ id: owner._id });

            const jobData = {
                company: company._id,
                jobTitle: "New Position",
                description: "Exciting role",
                image: "https://example.com/position.jpg",
            };

            const response = await request(app)
                .post("/api/v1/job-listings")
                .set("Authorization", "Bearer fake-jwt-token")
                .send(jobData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toHaveProperty(
                "jobTitle",
                "New Position",
            );
            expect(response.body.data).toHaveProperty(
                "description",
                "Exciting role",
            );

            // Verify job listing was saved to database
            const jobInDb = await JobListingModel.findById(
                response.body.data._id,
            );
            expect(jobInDb).not.toBeNull();
            expect(jobInDb?.jobTitle).toBe("New Position");
        });

        it("should return 500 (mock catch condition)", async () => {
            // Create owner and company
            const owner = await UserModel.create({
                name: "Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            const company = await CompanyModel.create({
                name: "Owner's Company",
                address: "123 Owner St",
                website: "https://ownerscompany.com",
                description: "Owner's company description",
                tel: "9876543210",
                owner: owner._id,
            });

            // Mock JWT verification to return the owner's ID with company role
            (jwt.verify as jest.Mock).mockReturnValue({
                id: owner._id,
                role: "company",
            });

            jest.spyOn(JobListingModel, "create").mockImplementation(() => {
                throw new Error("Mock unexpected error");
            });

            const jobData = {
                company: company._id,
                jobTitle: "New Position",
                description: "Exciting role",
                image: "https://example.com/position.jpg",
            };

            const response = await request(app)
                .post("/api/v1/job-listings")
                .set("Authorization", "Bearer fake-jwt-token")
                .send(jobData);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Mock unexpected error",
            );
        });
    });

    describe("PUT /api/v1/job-listings/:id", () => {
        it("should update a job listing when requested by the owner", async () => {
            // Create owner
            const owner = await UserModel.create({
                name: "Job Owner",
                email: "jobowner@test.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            // Create company
            const company = await CompanyModel.create({
                name: "Job Company",
                address: "123 Job St",
                website: "https://jobcompany.com",
                description: "Job company description",
                tel: "9876543210",
                owner: owner._id,
            });

            // Create job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Original Title",
                description: "Original description",
                image: "https://example.com/original.jpg",
            });

            // Mock JWT verification to return the owner's ID with company role
            (jwt.verify as jest.Mock).mockReturnValue({
                id: owner._id,
                role: "company",
            });

            const updateData = {
                jobTitle: "Updated Title",
                description: "Updated description",
            };

            const response = await request(app)
                .put(`/api/v1/job-listings/${jobListing._id}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toHaveProperty(
                "jobTitle",
                "Updated Title",
            );
            expect(response.body.data).toHaveProperty(
                "description",
                "Updated description",
            );

            // Verify job listing was updated in database
            const updatedJob = await JobListingModel.findById(jobListing._id);
            expect(updatedJob?.jobTitle).toBe("Updated Title");
        });

        it("should allow admins to update any job listing", async () => {
            // Create owner and company
            const owner = await UserModel.create({
                name: "Job Owner",
                email: "jobowner@test.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            const company = await CompanyModel.create({
                name: "Job Company",
                address: "123 Job St",
                website: "https://jobcompany.com",
                description: "Job company description",
                tel: "9876543210",
                owner: owner._id,
            });

            // Create job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Admin Update Test",
                description: "Will be updated by admin",
                image: "https://example.com/admin.jpg",
            });

            // Create admin user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "5555555555",
                role: "admin",
            });

            // Mock JWT verification to return the admin's ID with admin role
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const updateData = {
                jobTitle: "Admin Updated Title",
                description: "Admin updated description",
            };

            const response = await request(app)
                .put(`/api/v1/job-listings/${jobListing._id}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toHaveProperty(
                "jobTitle",
                "Admin Updated Title",
            );
        });

        it("should reject updates from unauthorized users", async () => {
            // Create owner and company
            const owner = await UserModel.create({
                name: "Job Owner",
                email: "jobowner@test.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            const company = await CompanyModel.create({
                name: "Job Company",
                address: "123 Job St",
                website: "https://jobcompany.com",
                description: "Job company description",
                tel: "9876543210",
                owner: owner._id,
            });

            // Create job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Unauthorized Test",
                description: "Should not be updated",
                image: "https://example.com/unauthorized.jpg",
            });

            // Create unauthorized user
            const unauthorizedUser = await UserModel.create({
                name: "Random User",
                email: "random@test.com",
                password: "password123",
                tel: "7777777777",
                role: "company",
            });

            // Mock JWT verification to return the unauthorized user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: unauthorizedUser._id,
                role: "company",
            });

            const updateData = {
                jobTitle: "Hacked Title",
                description: "Hacked description",
            };

            const response = await request(app)
                .put(`/api/v1/job-listings/${jobListing._id}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "You do not have permission to update this job listing",
            );

            // Verify job listing was not updated
            const unchangedJob = await JobListingModel.findById(jobListing._id);
            expect(unchangedJob?.jobTitle).toBe("Unauthorized Test");
        });

        it("should return 403 when user with 'user' role tries to update a job listing", async () => {
            // Create company owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            // Create company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test St",
                website: "https://testcompany.com",
                description: "A test company",
                tel: "9876543210",
                owner: owner._id,
            });

            // Create job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Software Engineer",
                description: "Build great software",
                image: "https://example.com/job.jpg",
            });

            // Create a regular user
            const regularUser = await UserModel.create({
                name: "Regular User",
                email: "user@test.com",
                password: "password123",
                tel: "5555555555",
                role: "user",
            });

            // Mock JWT verification to return the regular user's ID
            (jwt.verify as jest.Mock).mockReturnValue({
                id: regularUser._id,
                role: "user",
            });

            const updateData = {
                jobTitle: "Updated Job Title",
                description: "Updated description",
            };

            const response = await request(app)
                .put(`/api/v1/job-listings/${jobListing._id}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "User role 'user' is not authorized to access this route",
            );

            // Verify job listing was not updated
            const unchangedJob = await JobListingModel.findById(jobListing._id);
            expect(unchangedJob?.jobTitle).toBe("Software Engineer");
        });

        it("should return 404 when job not found", async () => {
            // Create owner and company
            const owner = await UserModel.create({
                name: "Job Owner",
                email: "jobowner@test.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            const company = await CompanyModel.create({
                name: "Job Company",
                address: "123 Job St",
                website: "https://jobcompany.com",
                description: "Job company description",
                tel: "9876543210",
                owner: owner._id,
            });

            // Create job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Admin Update Test",
                description: "Will be updated by admin",
                image: "https://example.com/admin.jpg",
            });

            // delete job listing
            await JobListingModel.findByIdAndDelete(jobListing._id);

            // Create admin user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "5555555555",
                role: "admin",
            });

            // Mock JWT verification to return the admin's ID with admin role
            (jwt.verify as jest.Mock).mockReturnValue({
                id: admin._id,
                role: "admin",
            });

            const updateData = {
                jobTitle: "Admin Updated Title",
                description: "Admin updated description",
            };

            const response = await request(app)
                .put(`/api/v1/job-listings/${jobListing._id}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Job listing not found",
            );
        });

        it("should return 400 when object id is invalid (catch)", async () => {
            // Create owner and company
            const owner = await UserModel.create({
                name: "Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            // Mock JWT verification to return the owner's ID with company role
            (jwt.verify as jest.Mock).mockReturnValue({
                id: owner._id,
                role: "company",
            });

            const updateData = {
                jobTitle: "Admin Updated Title",
                description: "Admin updated description",
            };

            const response = await request(app)
                .put(`/api/v1/job-listings/NOT_OBJECT_ID`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                'Mongoose Error: Cast to ObjectId failed for value "NOT_OBJECT_ID" (type string) at path "_id" for model "JobListing"',
            );
        });
    });

    describe("DELETE /api/v1/job-listings/:id", () => {
        it("should delete a job listing and related interview sessions", async () => {
            // Create owner and company
            const owner = await UserModel.create({
                name: "Delete Test Owner",
                email: "delete@test.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            const company = await CompanyModel.create({
                name: "Delete Test Company",
                address: "123 Delete St",
                website: "https://deletetest.com",
                description: "Delete test description",
                tel: "9876543210",
                owner: owner._id,
            });

            // Create job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Job To Delete",
                description: "This job will be deleted",
                image: "https://example.com/delete.jpg",
            });

            // Create some interview sessions for this job listing
            const user = await UserModel.create({
                name: "Interview User",
                email: "interview@test.com",
                password: "password123",
                tel: "6666666666",
                role: "user",
            });

            await InterviewSessionModel.create([
                {
                    jobListing: jobListing._id,
                    user: user._id,
                    date: new Date("2022-05-10T14:00:00Z"),
                },
                {
                    jobListing: jobListing._id,
                    user: user._id,
                    date: new Date("2022-05-12T15:30:00Z"),
                },
            ]);

            // Mock JWT verification to return the owner's ID with company role
            (jwt.verify as jest.Mock).mockReturnValue({
                id: owner._id,
                role: "company",
            });

            const response = await request(app)
                .delete(`/api/v1/job-listings/${jobListing._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);

            // Verify job listing was deleted
            const deletedJob = await JobListingModel.findById(jobListing._id);
            expect(deletedJob).toBeNull();

            // Verify interview sessions were also deleted
            const sessions = await InterviewSessionModel.find({
                jobListing: jobListing._id,
            });
            expect(sessions).toHaveLength(0);
        });

        it("should return 403 when company delete other company job", async () => {
            // Create owner and company
            const owner = await UserModel.create({
                name: "Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            const other = await UserModel.create({
                name: "Other",
                email: "other@test.com",
                password: "password123",
                tel: "1234557890",
                role: "company",
            });

            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Delete St",
                website: "https://test.com",
                description: "Delete test description",
                tel: "9876543210",
                owner: owner._id,
            });

            // Create job listing
            const jobListing = await JobListingModel.create({
                company: company._id,
                jobTitle: "Job",
                description: "This job",
                image: "https://example.com/delete.jpg",
            });

            // Create some interview sessions for this job listing
            const user = await UserModel.create({
                name: "Interview User",
                email: "interview@test.com",
                password: "password123",
                tel: "6666666666",
                role: "user",
            });

            await InterviewSessionModel.create([
                {
                    jobListing: jobListing._id,
                    user: user._id,
                    date: new Date("2022-05-10T14:00:00Z"),
                },
            ]);

            // Mock JWT verification to return the owner's ID with company role
            (jwt.verify as jest.Mock).mockReturnValue({
                id: other._id,
                role: "company",
            });

            const response = await request(app)
                .delete(`/api/v1/job-listings/${jobListing._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "You do not have permission to delete this job listing",
            );
        });

        it("should return 404 when job listing not found", async () => {
            // Create owner and company
            const owner = await UserModel.create({
                name: "Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            // Mock JWT verification to return the owner's ID with company role
            (jwt.verify as jest.Mock).mockReturnValue({
                id: owner._id,
                role: "company",
            });

            const response = await request(app)
                .delete(`/api/v1/job-listings/${new mongoose.Types.ObjectId()}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Job listing not found",
            );
        });

        it("should return 400 when object id is invalid (catch)", async () => {
            // Create owner and company
            const owner = await UserModel.create({
                name: "Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            // Mock JWT verification to return the owner's ID with company role
            (jwt.verify as jest.Mock).mockReturnValue({
                id: owner._id,
                role: "company",
            });

            const response = await request(app)
                .delete(`/api/v1/job-listings/NOT_OBJECT_ID`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                'Mongoose Error: Cast to ObjectId failed for value "NOT_OBJECT_ID" (type string) at path "_id" for model "JobListing"',
            );
        });
    });

    describe("Integration test - Job listing lifecycle", () => {
        it("should create, update, and delete a job listing with verification", async () => {
            // Create owner
            const owner = await UserModel.create({
                name: "Lifecycle Owner",
                email: "lifecycle@test.com",
                password: "password123",
                tel: "1234567890",
                role: "company",
            });

            // Create company
            const company = await CompanyModel.create({
                name: "Lifecycle Company",
                address: "123 Lifecycle St",
                website: "https://lifecycle.com",
                description: "Lifecycle description",
                tel: "9876543210",
                owner: owner._id,
            });

            // Mock JWT verification to return the owner's ID with company role
            (jwt.verify as jest.Mock).mockReturnValue({
                id: owner._id,
                role: "company",
            });

            // PHASE 1: Create job listing
            const jobData = {
                company: company._id,
                jobTitle: "Lifecycle Position",
                description: "Testing full lifecycle",
                image: "https://example.com/lifecycle.jpg",
            };

            const createResponse = await request(app)
                .post("/api/v1/job-listings")
                .set("Authorization", "Bearer fake-jwt-token")
                .send(jobData);

            expect(createResponse.status).toBe(201);
            expect(createResponse.body.data).toHaveProperty(
                "jobTitle",
                "Lifecycle Position",
            );

            const jobId = createResponse.body.data._id;

            // PHASE 2: Update job listing
            const updateData = {
                jobTitle: "Updated Lifecycle Position",
                description: "Updated lifecycle description",
            };

            const updateResponse = await request(app)
                .put(`/api/v1/job-listings/${jobId}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.data).toHaveProperty(
                "jobTitle",
                "Updated Lifecycle Position",
            );

            // PHASE 3: Delete job listing
            const deleteResponse = await request(app)
                .delete(`/api/v1/job-listings/${jobId}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(deleteResponse.status).toBe(200);

            // Verify job listing is gone
            const verifyResponse = await request(app).get(
                `/api/v1/job-listings/${jobId}`,
            );
            expect(verifyResponse.status).toBe(404);
        });
    });
});
