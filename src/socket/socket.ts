import { Server as HttpServer, IncomingMessage, ServerResponse } from "http";
import { Server as SocketIoServer } from "socket.io";
import { socketConnection } from "./event/connection";
import { socketAuth } from "./middleware/socketAuth";
import { socketChatValidatePermission } from "./middleware/socketChatValidatePermission";

export function initializeSocket(
    httpServer: HttpServer<typeof IncomingMessage, typeof ServerResponse>,
): SocketIoServer {
    const io = new SocketIoServer(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.use(socketAuth);
    io.use(socketChatValidatePermission);
    io.on("connection", socketConnection);

    return io;
}
