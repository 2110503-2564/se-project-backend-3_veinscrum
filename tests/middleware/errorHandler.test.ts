/*import { initializeApp } from "@/app";
import { CompanyModel } from "@/models/Company";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import { UserModel } from "@/models/User";
import type { Express } from "express";
import jwt from "jsonwebtoken";
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

describe("ErrorHandler Middleware", () => {
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

    it("should return duplicate error", async () => {
        // Create a user to be the owner
        const ownerA = await UserModel.create({
            name: "Company Owner",
            email: "owner@test.com",
            password: "password123",
            tel: "+1 (555) 444-3333",
            role: "company",
        });

        const ownerB = await UserModel.create({
            name: "Company Owner",
            email: "owner@test.com",
            password: "password123",
            tel: "+1 (555) 444-3333",
            role: "company",
        });
        // Mock JWT verification to return the owner's ID
        (jwt.verify as jest.Mock).mockReturnValue({ id: owner._id });

        const companyData = [
            {
                name: "New Tech Company",
                address: "789 Innovation Ave, Future City",
                website: "https://newtechco.com",
                description: "Cutting-edge technology solutions",
                tel: "+1 (555) 333-2222",
                owner: ownerA._id,
            },
            {
                name: "New Tech Company",
                address: "789 Innovation Ave, Future City",
                website: "https://newtechco.com",
                description: "Cutting-edge technology solutions",
                tel: "+1 (555) 333-2222",
                owner: ownerB._id,
            },
        ];
        await request(app)
            .post("/api/v1/companies")
            .set("Authorization", "Bearer fake-jwt-token")
            .send(companyData);

        const response = await request(app)
            .post("/api/v1/companies")
            .set("Authorization", "Bearer fake-jwt-token")
            .send(companyData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("error", "New Tech Company");
    });
});*/
