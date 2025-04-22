import swaggerUI from "swagger-ui-express";
import { swaggerDocs } from "./swagger";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import { xss } from "express-xss-sanitizer";
import helmet from "helmet";
import hpp from "hpp";

import { errorHandler } from "@/middleware/errorHandler";
import { authRouter } from "@/routes/auth";

import { chatsRouter } from "@/routes/chats";
import { companiesRouter } from "@/routes/companies";
import { interviewSessionsRouter } from "@/routes/interviewSessions";
import { jobListingsRouter } from "@/routes/jobListings";
import { usersRouter } from "@/routes/users";

export function initializeApp() {
    const app = express();

    // API docs
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

    // Middleware
    app.use(express.json({ limit: "10mb" }));
    app.use(cookieParser());
    app.use(mongoSanitize());
    app.use(helmet());
    app.use(xss());
    app.use(hpp());
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN?.split("|"),
            credentials: true,
        }),
    );

    // Routes
    app.use("/api/v1/auth", authRouter);
    app.use("/api/v1/companies", companiesRouter);
    app.use("/api/v1/sessions", interviewSessionsRouter);
    app.use("/api/v1/users", usersRouter);
    app.use("/api/v1/chats", chatsRouter);
    app.use("/api/v1/job-listings", jobListingsRouter);

    // Global error handler
    app.use(errorHandler);

    return app;
}
