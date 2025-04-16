import { NextFunction, Request, Response } from "express";
import { MongoServerError } from "mongodb"; // Import MongoDB error class
import { MongooseError } from "mongoose";

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.error(err);

    let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    let error: string;

    if (err instanceof MongoServerError) {
        statusCode = 400;
        if ((err as MongoServerError).code === 11000) {
            error = `Duplicate field value entered: ${Object.keys((err as MongoServerError).keyValue).join(", ")}`;
        } else {
            error = `MongoDB Error: ${(err as MongoServerError).message}`;
        }
    } else if (err instanceof MongooseError) {
        statusCode = 400;
        error = `Mongoose Error: ${(err as MongooseError).message}`;
    } else if (err instanceof Error) {
        error = (err as Error).message;
    } else {
        error = "Server Error";
    }

    res.status(statusCode).json({
        success: false,
        message: error,
    });
};
