import { authorize, protect } from "@/middleware/auth";
import { UserModel } from "@/models/User";
import type { RequestWithAuth } from "@/types/Request";
import type { User } from "@/types/models/User";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
        process.env.JWT_SECRET = "test-secret";
        jest.clearAllMocks();
    });

    describe("protect middleware", () => {
        it("should return 401 if no token is provided", async () => {
            await protect(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false }),
            );
            expect(next).not.toHaveBeenCalled();
        });

        it("should return 401 if token is invalid", async () => {
            req.headers = { authorization: "Bearer invalid-token" };
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new jwt.JsonWebTokenError("Invalid token");
            });

            await protect(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(401);
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
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.stringContaining("not found"),
                }),
            );
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("authorize middleware", () => {
        it("should return 403 if user role is not authorized", () => {
            (req as RequestWithAuth).user = mockUser;

            const authMiddleware = authorize("admin");
            authMiddleware(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
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

        it("should handle case when user has no role property", () => {
            const incompleteUser = {
                id: new mongoose.Types.ObjectId(),
            } as User;
            (req as RequestWithAuth).user = incompleteUser;

            const authMiddleware = authorize("admin", "user");
            authMiddleware(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.stringContaining("not authorized"),
                }),
            );
        });
    });
});
