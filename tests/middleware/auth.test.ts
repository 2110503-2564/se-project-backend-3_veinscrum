import { authorize, protect } from "@/middleware/auth";
import { UserModel } from "@/models/User";
import { User } from "@/types/models/User";
import type { RequestWithAuth } from "@/types/Request";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Mocking User model and jwt
jest.mock("@/models/User");
jest.mock("jsonwebtoken", () => ({
    __esModule: true,
    default: {
        verify: jest.fn(),
        sign: jest.fn(),
        JsonWebTokenError: class JsonWebTokenError extends Error {},
    },
}));

describe("Auth Middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;
    let mockUser: User;
    let mockAdmin: User;
    const ORIGINAL_JWT_SECRET = process.env.JWT_SECRET;

    beforeAll(() => {
        mockUser = { role: "user", id: new mongoose.Types.ObjectId() } as User;
        mockAdmin = {
            role: "admin",
            id: new mongoose.Types.ObjectId(),
        } as User;
    });

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();

        // Set the JWT_SECRET before each test
        process.env.JWT_SECRET = "test-secret"; // Ensure the JWT_SECRET is available for tests

        jest.clearAllMocks();
    });

    afterEach(() => {
        // Reset the JWT_SECRET after each test to prevent pollution
        process.env.JWT_SECRET = ORIGINAL_JWT_SECRET;
    });

    describe("protect middleware", () => {
        it("should return 401 if no token is provided", async () => {
            await protect(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "Not authorize to access this route",
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should return 401 if authorization header doesn't start with Bearer", async () => {
            req.headers = { authorization: "NotBearer token" };

            await protect(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "Not authorize to access this route",
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should return 401 if token is invalid", async () => {
            req.headers = { authorization: "Bearer invalid-token" };
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new jwt.JsonWebTokenError("Invalid token");
            });

            await protect(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "Not authorize to access this route",
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should pass if valid token is provided", async () => {
            req.headers = { authorization: "Bearer valid-token" };
            (jwt.verify as jest.Mock).mockReturnValue({ id: mockUser.id });
            (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

            await protect(req as Request, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect((req as RequestWithAuth).user).toEqual(mockUser);
        });

        it("should return 401 if user not found", async () => {
            req.headers = { authorization: "Bearer valid-token" };
            (jwt.verify as jest.Mock).mockReturnValue({ id: "nonexistent-id" });
            (UserModel.findById as jest.Mock).mockResolvedValue(null);

            await protect(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "User not found",
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with error if JWT_SECRET is not defined", async () => {
            delete process.env.JWT_SECRET;
            req.headers = { authorization: "Bearer valid-token" };

            await protect(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "JWT_SECRET must be defined in .env file",
                }),
            );
        });

        it("should return if error is not JsonWebTokenError", async () => {
            req.headers = { authorization: "Bearer valid-token" };
            process.env.JWT_SECRET = "test-secret";

            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error("Different error");
            });

            await protect(req as Request, res as Response, next);

            expect(res.status).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("authorize middleware", () => {
        it("should return 403 if user role is not authorized", () => {
            (req as RequestWithAuth).user = mockUser;

            const authMiddleware = authorize("admin");
            authMiddleware(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "User role 'user' is not authorized to access this route",
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should return 401 if user not found", () => {
            const authMiddleware = authorize("user");
            authMiddleware(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "Not authorize to access this route",
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next if user role is authorized", () => {
            (req as RequestWithAuth).user = mockAdmin;

            const authMiddleware = authorize("admin");
            authMiddleware(req as Request, res as Response, next);

            expect(next).toHaveBeenCalled();
        });

        it("should allow multiple roles to be authorized", () => {
            (req as RequestWithAuth).user = mockUser;

            const authMiddleware = authorize("admin", "user");
            authMiddleware(req as Request, res as Response, next);

            expect(next).toHaveBeenCalled();
        });
    });
});
