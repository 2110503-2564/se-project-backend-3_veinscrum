import express from "express";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";

import { connectDB } from "../config/db";
import { authRouter } from "@/routes/auth";
import { companiesRouter } from "@/routes/companies";
import { interviewSessionsRouter } from "@/routes/interviewSessions";
import { errorHandler } from "@/middleware/errorHandler";

dotenv.config({ path: "./config/config.env" });

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/companies", companiesRouter);
app.use("/api/v1/sessions", interviewSessionsRouter);

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
