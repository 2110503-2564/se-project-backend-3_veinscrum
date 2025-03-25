import { MongoServerError } from "mongodb"; // Import MongoDB error class
import { MongooseError } from "mongoose";
export const errorHandler = (err, req, res, next) => {
    console.error(err);
    let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    let message;
    if (err instanceof MongoServerError) {
        statusCode = 400;
        if (err.code === 11000) {
            message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(", ")}`;
        }
        else {
            message = `MongoDB Error: ${err.message}`;
        }
    }
    else if (err instanceof MongooseError) {
        statusCode = 400;
        message = `Mongoose Error: ${err.message}`;
    }
    else if (err instanceof Error) {
        message = err.message;
    }
    else {
        message = "Server Error";
    }
    res.status(statusCode).json({
        success: false,
        error: message,
    });
};
