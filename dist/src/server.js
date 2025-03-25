import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { companiesRouter } from "./routes/companies.js";
import { interviewSessionsRouter } from "./routes/interviewSessions.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import { xss } from "express-xss-sanitizer";
import helmet from "helmet";
import { connectDB } from "../config/db.js";
import hpp from "hpp";
import { usersRouter } from "./routes/users.js";
dotenv.config();
connectDB();
const app = express();
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
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/companies", companiesRouter);
app.use("/api/v1/sessions", interviewSessionsRouter);
app.use("/api/v1/users", usersRouter);
app.use(errorHandler);
const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () =>
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    ),
);
process.on("unhandledRejection", (err, promise) => {
    if (!(err instanceof Error)) return;
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
