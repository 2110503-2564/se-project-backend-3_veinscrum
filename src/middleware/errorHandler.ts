import { Request, Response, NextFunction } from "express";
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
    let message = "Server Error";

    if (err instanceof Error) {
        message = err.message;
    }

    if (err instanceof MongoServerError) {
        statusCode = 400;
        message = `MongoDB Error: ${err.message}`;
    } else if (err instanceof MongooseError) {
        statusCode = 400;
        message = `Mongoose Error: ${err.message}`;
    }

    res.status(statusCode).json({
        success: false,
        error: message,
    });
};
