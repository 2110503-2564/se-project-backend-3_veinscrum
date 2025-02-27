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
    let message = "Server Error";

    switch (err?.constructor) {
        case Error:
            message = (err as Error).message;
            break;
        case MongoServerError:
            statusCode = 400;
            if ((err as MongoServerError).code === 11000) {
                message = `Duplicate field value entered: ${Object.keys((err as MongoServerError).keyValue).join(", ")}`;
            } else {
                message = `MongoDB Error: ${(err as MongoServerError).message}`;
            }
            break;
        case MongooseError:
            statusCode = 400;
            message = `Mongoose Error: ${(err as MongooseError).message}`;
            break;
    }

    res.status(statusCode).json({
        success: false,
        error: message,
    });
};
