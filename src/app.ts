import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import { xss } from "express-xss-sanitizer";
import helmet from "helmet";
import hpp from "hpp";

import { errorHandler } from "@/middleware/errorHandler";
import { authRouter } from "@/routes/auth";
import { companiesRouter } from "@/routes/companies";
import { interviewSessionsRouter } from "@/routes/interviewSessions";
import { jobListingsRouter } from "@/routes/jobListings";
import { usersRouter } from "@/routes/users";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

export function initializeApp() {
    const app = express();
    const swaggerOptions = {
        swaggerDefinition: {
            openapi: "3.0.0",
            info: {
                title: "Library API",
                version: "1.0.0",
                description: "A simple Job Fair API",
            },
            servers: [
                {
                    url: "http://localhost:5050/api/v1",
                },
            ],
        },
        apis: ["**/routes/*.ts"],
    };
    const swaggerDocs = swaggerJSDoc(swaggerOptions);
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

    // Middleware
    app.use(express.json());
    app.use(cookieParser());
    app.use(mongoSanitize());
    app.use(helmet());
    app.use(xss());
    app.use(hpp());
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        }),
    );

    // Routes
    app.use("/api/v1/auth", authRouter);
    app.use("/api/v1/companies", companiesRouter);
    app.use("/api/v1/sessions", interviewSessionsRouter);
    app.use("/api/v1/users", usersRouter);
    app.use("/api/v1/job-listings", jobListingsRouter);

    // Global error handler
    app.use(errorHandler);

    return app;
}
