import { errorHandler } from "@/middleware/errorHandler";
import type { Request, Response } from "express";
import { MongoServerError } from "mongodb";
import { MongooseError } from "mongoose";

describe("Error Handler Middleware", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            statusCode: 200,
        };
        nextFunction = jest.fn();
    });

    it("should handle MongoServerError with duplicate key (code 11000)", () => {
        const duplicateError = new MongoServerError({ message: "Duplicate key error" });
        duplicateError.code = 11000;
        duplicateError.keyValue = { email: "test@test.com" };

        errorHandler(
            duplicateError,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction,
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: "Duplicate field value entered: email",
        });
    });

    it("should handle other MongoServerErrors", () => {
        const mongoError = new MongoServerError({ message: "MongoDB connection error" });

        errorHandler(
            mongoError,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction,
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: "MongoDB Error: MongoDB connection error",
        });
    });

    it("should handle MongooseError", () => {
        const mongooseError = new MongooseError("Validation failed");

        errorHandler(
            mongooseError,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction,
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: "Mongoose Error: Validation failed",
        });
    });

    it("should handle standard Error", () => {
        const standardError = new Error("Something went wrong");

        errorHandler(
            standardError,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction,
        );

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: "Something went wrong",
        });
    });

    it("should handle unknown error types", () => {
        const unknownError = "Just a string error";

        errorHandler(
            unknownError,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction,
        );

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: "Server Error",
        });
    });

    it("should use existing status code if not 200", () => {
        mockResponse.statusCode = 404;
        const error = new Error("Not Found");

        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction,
        );

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: "Not Found",
        });
    });
});