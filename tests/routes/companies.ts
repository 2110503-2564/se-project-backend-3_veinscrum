import { app } from "@/app";
import { CompanyModel } from "@/models/Company";
import { UserModel } from "@/models/User";
import jwt from "jsonwebtoken";
import request from "supertest";

jest.mock("@/models/Company");
jest.mock("@/models/User");
jest.mock("jsonwebtoken", () => ({
    __esModule: true,
    default: {
        verify: jest.fn(),
        sign: jest.fn(),
        JsonWebTokenError: class JsonWebTokenError extends Error {},
    },
}));

describe("Companies Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/v1/companies", () => {
        it("should fetch all companies", async () => {
            const mockCompanies = {
                success: true,
                count: 2,
                data: [
                    {
                        _id: "67bb4bb4e34986cbf051e99c",
                        id: "67bb4bb4e34986cbf051e99c",
                        name: "Deep Learning Systems",
                        sessions: [],
                        website: "https://deeplearnsys.ai",
                    },
                    {
                        _id: "67bb4b2be34986cbf051e961",
                        id: "67bb4b2be34986cbf051e961",
                        name: "Database Solutions",
                        sessions: [
                            {
                                __v: 0,
                                _id: "67df1fa18a9ae943827281f8",
                                company: "67bb4b2be34986cbf051e961",
                                createdAt: "2025-03-22T20:37:53.485Z",
                                date: "2022-05-09T17:15:00.000Z",
                                user: "67df1f9a8a9ae943827281f2",
                            },
                        ],
                        website: "https://dbsolutions.com",
                    },
                ],
                pagination: {
                    next: {
                        limit: 25,
                        page: 2,
                    },
                },
            };

            (CompanyModel.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockCompanies),
            });

            (CompanyModel.countDocuments as jest.Mock).mockResolvedValue(2);

            const response = await request(app).get("/api/v1/companies");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data.count).toBe(
                response.body.data.data.length,
            );
            expect(response.body.data).toStrictEqual(mockCompanies);
        });
    });

    describe("GET /api/v1/companies/:id", () => {
        it("should fetch a single company by ID", async () => {
            const mockCompany = {
                _id: "1",
                name: "Company 1",
                sessions: [],
            };

            (CompanyModel.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockCompany),
            });

            const response = await request(app).get("/api/v1/companies/1");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toEqual(mockCompany);
        });

        it("should return 400 if company not found", async () => {
            (CompanyModel.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            const response = await request(app).get("/api/v1/companies/999");

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
        });
    });

    describe("POST /api/v1/companies", () => {
        it("should create a company when authorized as admin", async () => {
            const companyData = {
                name: "New Company",
                website: "https://newcompany.com",
                description: "A new company",
            };

            const mockUser = { _id: "admin123", role: "admin" };
            const mockCompany = { ...companyData, _id: "company1" };

            (jwt.verify as jest.Mock).mockReturnValue({ id: "admin123" });
            (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
            (CompanyModel.create as jest.Mock).mockResolvedValue(mockCompany);

            const response = await request(app)
                .post("/api/v1/companies")
                .set("Authorization", "Bearer token")
                .send(companyData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toEqual(mockCompany);
        });
    });

    describe("Integration test - Add and retrieve company", () => {
        it("should create a company and then be able to retrieve it", async () => {
            const companyData = {
                name: "Integration Test Company",
                website: "https://integrationtest.com",
                description: "Company created during integration test",
            };

            const mockUser = { _id: "admin123", role: "admin" };
            const createdCompany = {
                ...companyData,
                _id: "integration1",
                sessions: [],
            };

            // Setup mocks for creation
            (jwt.verify as jest.Mock).mockReturnValue({ id: "admin123" });
            (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
            (CompanyModel.create as jest.Mock).mockResolvedValue(
                createdCompany,
            );

            // Create the company
            const createResponse = await request(app)
                .post("/api/v1/companies")
                .set("Authorization", "Bearer token")
                .send(companyData);

            expect(createResponse.status).toBe(201);
            expect(createResponse.body.data._id).toBe("integration1");

            // Setup mocks for retrieval
            (CompanyModel.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(createdCompany),
            });

            // Retrieve the created company
            const getResponse = await request(app).get(
                "/api/v1/companies/integration1",
            );

            expect(getResponse.status).toBe(200);
            expect(getResponse.body).toHaveProperty("success", true);
            expect(getResponse.body.data).toEqual(createdCompany);
            expect(getResponse.body.data.name).toBe("Integration Test Company");
            expect(getResponse.body.data.website).toBe(
                "https://integrationtest.com",
            );
        });
    });
});
