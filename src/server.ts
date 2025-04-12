import dotenv from "dotenv";
import { connectDB } from "../config/db";
import { app } from "./app";

dotenv.config({path:'./config/config.env'});

connectDB();

const PORT = process.env.PORT || 5050;

const server = app.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
});

process.on("unhandledRejection", (err, promise) => {
    if (!(err instanceof Error)) return;
    console.log(`Error: ${err.message}`);
    console.log(`Unhandled Rejection at:`, promise);
    server.close(() => process.exit(1));
});
