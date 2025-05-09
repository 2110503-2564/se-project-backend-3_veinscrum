import { initializeApp } from "@/app";
import { UserModel } from "@/models/User";
import type { Express } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";

jest.mock("@/models/User");
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

beforeEach(async () => {
    jest.clearAllMocks();
});

describe("Auth Routes", () => {
    describe("POST /api/v1/auth/register", () => {
        it("should register a new user and return token", async () => {
            const userData = {
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                tel: "1234567890",
            };

            const mockUser = {
                ...userData,
                _id: "mockid123",
                getSignedJwtToken: jest.fn().mockReturnValue("test-token"),
            };
            (UserModel.create as jest.Mock).mockResolvedValue(mockUser);

            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("token");
            expect(UserModel.create).toHaveBeenCalledWith(userData);
        });

        it("should return 400 error if email already exists", async () => {
            const userData = {
                name: "Test User",
                email: "test@example.com",
                tel: "1234567890",
                password: "password123",
                role: "user",
            };

            const error = new mongoose.Error.ValidationError();
            error.errors.email = new mongoose.Error.ValidatorError({
                message: "Email already exists",
                path: "email",
                value: userData.email,
            });

            (UserModel.create as jest.Mock).mockRejectedValue(error);

            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
        });
    });

    describe("POST /api/v1/auth/login", () => {
        it("should login and return token for valid credentials", async () => {
            const loginData = {
                email: "test@example.com",
                password: "password123",
            };

            const mockUser = {
                _id: "mockid123",
                email: loginData.email,
                matchPassword: jest.fn().mockResolvedValue(true),
                getSignedJwtToken: jest.fn().mockReturnValue("test-token"),
            };
            (UserModel.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(loginData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("token", "test-token");
        });

        it("should login and return token for valid credentials(Production)", async () => {
            const oldEnv = process.env.JWT_COOKIE_EXPIRE;
            const loginData = {
                email: "test@example.com",
                password: "password123",
            };

            const mockUser = {
                _id: "mockid123",
                email: loginData.email,
                matchPassword: jest.fn().mockResolvedValue(true),
                getSignedJwtToken: jest.fn().mockReturnValue("test-token"),
            };
            (UserModel.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            process.env.NODE_ENV = "production";

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(loginData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("token", "test-token");
            process.env.NODE_ENV = oldEnv;
        });

        it("should return 400 if email or password is missing", async () => {
            const loginData = {
                email: "",
                password: "password123",
            };

            const mockUser = {
                _id: "mockid123",
                email: loginData.email,
                matchPassword: jest.fn().mockResolvedValue(true),
                getSignedJwtToken: jest.fn().mockReturnValue("test-token"),
            };
            (UserModel.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(loginData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Please provide email and password",
            );
        });

        it("should return 400 if email don't exist", async () => {
            const loginData = {
                email: "abc@abc.abc",
                password: "password123",
            };

            (UserModel.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(null),
            });

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(loginData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Invalid credentials",
            );
        });

        it("should return 500 if JWT_COOKIE_EXPIRE is undefined", async () => {
            const oldEnv = process.env.JWT_COOKIE_EXPIRE;

            const loginData = {
                email: "test@example.com",
                password: "password123",
            };

            const mockUser = {
                _id: "mockid123",
                email: loginData.email,
                matchPassword: jest.fn().mockResolvedValue(true),
                getSignedJwtToken: jest.fn().mockReturnValue("test-token"),
            };
            (UserModel.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            if (process.env.JWT_COOKIE_EXPIRE) {
                process.env.JWT_COOKIE_EXPIRE = "";
            }

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(loginData);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "JWT_COOKIE_EXPIRE is not defined in .env file",
            );
            process.env.JWT_COOKIE_EXPIRE = oldEnv;
        });

        it("should return 401 for invalid credentials", async () => {
            const loginData = {
                email: "test@example.com",
                password: "wrongpassword",
            };

            const mockUser = {
                email: loginData.email,
                matchPassword: jest.fn().mockResolvedValue(false),
            };
            (UserModel.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(loginData);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Invalid credentials",
            );
        });

        it("should return 500 for unexpected error", async () => {
            const loginData = {
                email: "test@example.com",
                password: "wrongpassword",
            };

            const mockUser = {
                email: loginData.email,
                matchPassword: jest.fn().mockResolvedValue(false),
            };
            (UserModel.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            jest.spyOn(UserModel, "findOne").mockImplementation(() => {
                throw new Error("Mock unexpected error");
            });

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(loginData);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty(
                "error",
                "Mock unexpected error",
            );
        });
    });

    describe("GET /api/v1/auth/me", () => {
        it("should return user data when authenticated", async () => {
            const mockUser = {
                _id: "mockid123",
                name: "Test User",
                email: "test@example.com",
            };
            (jwt.verify as jest.Mock).mockReturnValue({ id: "mockid123" });
            (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

            const response = await request(app)
                .get("/api/v1/auth/me")
                .set("Authorization", "Bearer test-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toMatchObject({
                name: mockUser.name,
                email: mockUser.email,
            });
        });
    });

    describe("GET /api/v1/auth/logout", () => {
        it("should logout", async () => {
            const mockUser = {
                _id: "mockid123",
                name: "Test User",
                email: "test@example.com",
            };
            (jwt.verify as jest.Mock).mockReturnValue({ id: "mockid123" });
            (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

            const response = await request(app)
                .get("/api/v1/auth/logout")
                .set("Authorization", "Bearer test-token");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data", {});
        });
    });

    describe("Integration test - Register and get profile", () => {
        it("should register a user and then retrieve their profile", async () => {
            // User registration data
            const userData = {
                name: "Integration User",
                email: "integration@example.com",
                password: "securepass123",
                tel: "9876543210",
            };

            // Mock for user creation
            const createdUser = {
                ...userData,
                _id: "integration123",
                getSignedJwtToken: jest
                    .fn()
                    .mockReturnValue("integration-token"),
            };
            (UserModel.create as jest.Mock).mockResolvedValue(createdUser);

            // Register the user
            const registerResponse = await request(app)
                .post("/api/v1/auth/register")
                .send(userData);
            expect(registerResponse.status).toBe(201);
            expect(registerResponse.body.token).toBe("integration-token");

            // Setup mocks for authentication
            (jwt.verify as jest.Mock).mockReturnValue({ id: "integration123" });
            (UserModel.findById as jest.Mock).mockResolvedValue({
                _id: "integration123",
                name: userData.name,
                email: userData.email,
                tel: userData.tel,
            });

            // Get user profile using the token
            const profileResponse = await request(app)
                .get("/api/v1/auth/me")
                .set("Authorization", `Bearer ${registerResponse.body.token}`);

            expect(profileResponse.status).toBe(200);
            expect(profileResponse.body).toHaveProperty("success", true);
            expect(profileResponse.body.data).toHaveProperty(
                "name",
                userData.name,
            );
            expect(profileResponse.body.data).toHaveProperty(
                "email",
                userData.email,
            );
            expect(profileResponse.body.data).toHaveProperty(
                "tel",
                userData.tel,
            );
        });
    });
});
