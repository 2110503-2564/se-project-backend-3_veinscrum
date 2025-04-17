import { CompanyModel } from "@/models/Company";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import { UserModel } from "@/models/User";
import { Company } from "@/types/Company";
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

describe("Companies Routes", () => {
    beforeAll(async () => {
        await CompanyModel.deleteMany({});
        await UserModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
        await JobListingModel.deleteMany({});
    });

    afterAll(async () => {
        await CompanyModel.deleteMany({});
        await UserModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
        await JobListingModel.deleteMany({});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await CompanyModel.deleteMany({});
        await UserModel.deleteMany({});
        await InterviewSessionModel.deleteMany({});
        await JobListingModel.deleteMany({});
    });

    describe("GET /api/v1/companies", () => {
        it("should fetch all companies", async () => {
            // Create test companies in the database
            const companies = [
                {
                    name: "Deep Learning Systems",
                    address: "123 AI Street, Tech City",
                    website: "https://deeplearnsys.ai",
                    description: "Specialized in deep learning solutions",
                    tel: "+1 (555) 123-4567",
                    owner: new mongoose.Types.ObjectId(),
                },
                {
                    name: "Database Solutions",
                    address: "456 Data Drive, Server Valley",
                    website: "https://dbsolutions.com",
                    description: "Enterprise database management",
                    tel: "+1 (555) 987-6543",
                    owner: new mongoose.Types.ObjectId(),
                },
            ];

            await CompanyModel.create(companies);

            const response = await request(app).get("/api/v1/companies");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(response.body.count).toBe(2);
            expect(response.body.data.length).toBe(2);

            // Check for company names in the response, order might vary
            const companyNames = response.body.data.map((c: Company) => c.name);
            expect(companyNames).toContain("Deep Learning Systems");
            expect(companyNames).toContain("Database Solutions");
        });
    });

    describe("GET /api/v1/companies/:id", () => {
        it("should fetch a single company by ID", async () => {
            // Create a test company
            const company = await CompanyModel.create({
                name: "Test Company",
                address: "123 Test Street, Test City",
                website: "https://testcompany.com",
                description: "A company for testing",
                tel: "+1 (555) 111-2222",
                owner: new mongoose.Types.ObjectId(),
            });

            const response = await request(app).get(
                `/api/v1/companies/${company._id}`,
            );

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toHaveProperty("name", "Test Company");
            expect(response.body.data).toHaveProperty(
                "address",
                "123 Test Street, Test City",
            );
            expect(response.body.data._id.toString()).toBe(
                company._id.toString(),
            );
        });

        it("should return 404 if company not found", async () => {
            const nonExistingId = new mongoose.Types.ObjectId();
            const response = await request(app).get(
                `/api/v1/companies/${nonExistingId}`,
            );

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Company not found");
        });
    });

    describe("POST /api/v1/companies", () => {
        it("should create a company and update owner", async () => {
            // Create a user to be the owner
            const owner = await UserModel.create({
                name: "Company Owner",
                email: "owner@test.com",
                password: "password123",
                tel: "+1 (555) 444-3333",
                role: "company",
            });

            // Mock JWT verification to return the owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({ id: owner._id });

            const companyData = {
                name: "New Tech Company",
                address: "789 Innovation Ave, Future City",
                website: "https://newtechco.com",
                description: "Cutting-edge technology solutions",
                tel: "+1 (555) 333-2222",
            };

            const response = await request(app)
                .post("/api/v1/companies")
                .set("Authorization", "Bearer fake-jwt-token")
                .send(companyData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toHaveProperty(
                "name",
                "New Tech Company",
            );

            // Verify company was created in database
            const companyInDb = await CompanyModel.findById(
                response.body.data._id,
            );
            expect(companyInDb).not.toBeNull();
            expect(companyInDb?.name).toBe("New Tech Company");

            // Verify owner was updated with company reference
            const updatedOwner = await UserModel.findById(owner._id);
            expect(updatedOwner?.company?.toString()).toBe(
                response.body.data._id.toString(),
            );
        });

        it("should return validation errors for missing required fields", async () => {
            // Create a user to be the owner
            const owner = await UserModel.create({
                name: "Invalid Company Owner",
                email: "invalid@test.com",
                password: "password123",
                tel: "+1 (555) 444-5555",
                role: "company",
            });

            // Mock JWT verification to return the owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({ id: owner._id });

            const invalidCompanyData = {
                name: "Incomplete Company",
                // Missing required fields
                owner: owner._id,
            };

            const response = await request(app)
                .post("/api/v1/companies")
                .set("Authorization", "Bearer fake-jwt-token")
                .send(invalidCompanyData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
        });
    });

    describe("PUT /api/v1/companies/:id", () => {
        it("should update a company", async () => {
            // Create an owner user
            const owner = await UserModel.create({
                name: "Update Company Owner",
                email: "update-owner@test.com",
                password: "password123",
                tel: "+1 (555) 666-7777",
                role: "company",
            });

            // Mock JWT verification to return the owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({ id: owner._id });

            // Create a company to update
            const company = await CompanyModel.create({
                name: "Company to Update",
                address: "123 Old Street, Old City",
                website: "https://oldcompany.com",
                description: "Old company description",
                tel: "+1 (555) 888-9999",
            });

            // Update owner with company reference
            await UserModel.findByIdAndUpdate(owner._id, {
                company: company._id,
            });

            const updateData = {
                name: "Updated Company Name",
                description: "Updated company description",
            };

            const response = await request(app)
                .put(`/api/v1/companies/${company._id}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toHaveProperty(
                "name",
                "Updated Company Name",
            );
            expect(response.body.data).toHaveProperty(
                "description",
                "Updated company description",
            );

            // Original fields should remain unchanged
            expect(response.body.data).toHaveProperty(
                "address",
                "123 Old Street, Old City",
            );
            expect(response.body.data).toHaveProperty(
                "tel",
                "+1 (555) 888-9999",
            );

            // Verify changes in database
            const updatedCompany = await CompanyModel.findById(company._id);
            expect(updatedCompany?.name).toBe("Updated Company Name");
            expect(updatedCompany?.description).toBe(
                "Updated company description",
            );
        });

        it("should return 404 if company to update is not found", async () => {
            // Create a user
            const owner = await UserModel.create({
                name: "Non-existent Company Owner",
                email: "nonexistent@test.com",
                password: "password123",
                tel: "+1 (555) 111-0000",
                role: "company",
            });

            // Mock JWT verification to return the owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({ id: owner._id });

            const nonExistingId = new mongoose.Types.ObjectId();
            const updateData = {
                name: "Updated Non-existent Company",
            };

            const response = await request(app)
                .put(`/api/v1/companies/${nonExistingId}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Company not found");
        });
    });

    describe("DELETE /api/v1/companies/:id", () => {
        it("should delete a company and its associated job listings and interview sessions", async () => {
            // Create an admin user
            const admin = await UserModel.create({
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                tel: "+1 (555) 222-3333",
                role: "admin",
            });

            // Create a user for interview sessions
            const user = await UserModel.create({
                name: "Regular User",
                email: "user@test.com",
                password: "password123",
                tel: "+1 (555) 444-5555",
                role: "user",
            });

            // Create a company to delete
            const company = await CompanyModel.create({
                name: "Company to Delete",
                address: "123 Delete Street, Delete City",
                website: "https://deletecompany.com",
                description: "Company to be deleted",
                tel: "+1 (555) 333-4444",
                owner: new mongoose.Types.ObjectId(),
            });

            // Create job listings for the company
            const jobListings = await JobListingModel.create([
                {
                    company: company._id,
                    jobTitle: "Software Engineer",
                    description: "Backend developer position",
                    image: "https://example.com/software-engineer.jpg",
                },
                {
                    company: company._id,
                    jobTitle: "UI/UX Designer",
                    description: "Design position for our products",
                    image: "https://example.com/designer.jpg",
                },
            ]);

            // Create associated interview sessions with proper jobListing reference
            await InterviewSessionModel.create([
                {
                    jobListing: jobListings[0]._id,
                    user: user._id,
                    date: new Date("2022-05-10T14:00:00Z"),
                },
                {
                    jobListing: jobListings[1]._id,
                    user: user._id,
                    date: new Date("2022-05-12T15:30:00Z"),
                },
            ]);

            // Mock JWT verification to return the admin's ID
            (jwt.verify as jest.Mock).mockReturnValue({ id: admin._id });

            const response = await request(app)
                .delete(`/api/v1/companies/${company._id}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);

            // Verify company was deleted from database
            const deletedCompany = await CompanyModel.findById(company._id);
            expect(deletedCompany).toBeNull();

            // Verify associated job listings were deleted
            const remainingJobListings = await JobListingModel.find({
                company: company._id,
            });
            expect(remainingJobListings.length).toBe(0);

            // Verify associated interview sessions were deleted
            const remainingSessionsForJobListing1 =
                await InterviewSessionModel.find({
                    jobListing: jobListings[0]._id,
                });
            const remainingSessionsForJobListing2 =
                await InterviewSessionModel.find({
                    jobListing: jobListings[1]._id,
                });
            expect(remainingSessionsForJobListing1.length).toBe(0);
            expect(remainingSessionsForJobListing2.length).toBe(0);
        });

        it("should return 404 if company to delete is not found", async () => {
            // Create an admin user
            const admin = await UserModel.create({
                name: "Another Admin",
                email: "another-admin@test.com",
                password: "password123",
                tel: "+1 (555) 222-5555",
                role: "admin",
            });

            // Mock JWT verification to return the admin's ID
            (jwt.verify as jest.Mock).mockReturnValue({ id: admin._id });

            const nonExistingId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(`/api/v1/companies/${nonExistingId}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Company not found");
        });
    });

    describe("Integration test - Company lifecycle", () => {
        it("should create, update, and delete a company with database verification", async () => {
            // Create a user to be the owner
            const owner = await UserModel.create({
                name: "Lifecycle Test Owner",
                email: "lifecycle@test.com",
                password: "password123",
                tel: "+1 (555) 987-6543",
                role: "company",
            });

            // Mock JWT verification to return the owner's ID
            (jwt.verify as jest.Mock).mockReturnValue({ id: owner._id });

            // PHASE 1: Create company
            const companyData = {
                name: "Lifecycle Test Company",
                address: "123 Test Street, Test City",
                website: "https://lifecycletest.com",
                description: "Testing company lifecycle",
                tel: "+1 (555) 123-4567",
                owner: owner._id,
            };

            // Create the company
            const createResponse = await request(app)
                .post("/api/v1/companies")
                .set("Authorization", "Bearer fake-jwt-token")
                .send(companyData);

            expect(createResponse.status).toBe(201);
            expect(createResponse.body).toHaveProperty("success", true);
            expect(createResponse.body.data).toHaveProperty(
                "name",
                "Lifecycle Test Company",
            );

            const companyId = createResponse.body.data._id;

            // Verify company exists in database after creation
            const getAfterCreateResponse = await request(app)
                .get(`/api/v1/companies/${companyId}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(getAfterCreateResponse.status).toBe(200);
            expect(getAfterCreateResponse.body.data).toHaveProperty(
                "name",
                companyData.name,
            );
            expect(getAfterCreateResponse.body.data).toHaveProperty(
                "address",
                companyData.address,
            );

            // PHASE 2: Update company
            const updatedCompanyData = {
                name: "Updated Lifecycle Company",
                description: "Updated lifecycle description",
            };

            const updateResponse = await request(app)
                .put(`/api/v1/companies/${companyId}`)
                .set("Authorization", "Bearer fake-jwt-token")
                .send(updatedCompanyData);

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.data).toHaveProperty(
                "name",
                updatedCompanyData.name,
            );
            expect(updateResponse.body.data).toHaveProperty(
                "description",
                updatedCompanyData.description,
            );

            // Verify company was updated in database
            const getAfterUpdateResponse = await request(app)
                .get(`/api/v1/companies/${companyId}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(getAfterUpdateResponse.status).toBe(200);
            expect(getAfterUpdateResponse.body.data).toHaveProperty(
                "name",
                updatedCompanyData.name,
            );
            expect(getAfterUpdateResponse.body.data).toHaveProperty(
                "description",
                updatedCompanyData.description,
            );
            // Original fields should remain unchanged
            expect(getAfterUpdateResponse.body.data).toHaveProperty(
                "address",
                companyData.address,
            );
            expect(getAfterUpdateResponse.body.data).toHaveProperty(
                "tel",
                companyData.tel,
            );

            // PHASE 3: Delete company
            // Create an admin user for deletion (optional if owner can delete their own company)
            const admin = await UserModel.create({
                name: "Admin For Deletion",
                email: "admin-delete@test.com",
                password: "password123",
                tel: "+1 (555) 111-2222",
                role: "admin",
            });

            // Switch JWT verification to admin
            (jwt.verify as jest.Mock).mockReturnValue({ id: admin._id });

            const deleteResponse = await request(app)
                .delete(`/api/v1/companies/${companyId}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body).toHaveProperty("success", true);

            // Verify company is no longer in database
            const getAfterDeleteResponse = await request(app)
                .get(`/api/v1/companies/${companyId}`)
                .set("Authorization", "Bearer fake-jwt-token");

            expect(getAfterDeleteResponse.status).toBe(404);
            expect(getAfterDeleteResponse.body).toHaveProperty(
                "success",
                false,
            );
            expect(getAfterDeleteResponse.body).toHaveProperty(
                "error",
                "Company not found",
            );
        });
    });
});
