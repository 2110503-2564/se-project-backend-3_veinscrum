import dotenv from "dotenv";

dotenv.config();

import { createServer } from "node:http";
import { initializeApp } from "./app";
import { connectDB } from "./config/db";
import { initializeSocket } from "./socket/socket";

connectDB();

const PORT = process.env.PORT || 5050;

const app = initializeApp();
const httpServer = createServer(app);
initializeSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
});

process.on("unhandledRejection", (err, promise) => {
    if (!(err instanceof Error)) return;
    console.log(`Error: ${err.message}`);
    console.log("Unhandled Rejection at:", promise);
    httpServer.close(() => process.exit(1));
});
