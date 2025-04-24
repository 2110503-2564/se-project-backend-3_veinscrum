import type {
    Server as HttpServer,
    IncomingMessage,
    ServerResponse,
} from "node:http";
import { Server as SocketIoServer } from "socket.io";
import { socketConnection } from "./event/connection";
import { socketAuth } from "./middleware/socketAuth";
import { socketChatValidatePermission } from "./middleware/socketChatValidatePermission";

export let io: SocketIoServer;

export function initializeSocket(
    httpServer: HttpServer<typeof IncomingMessage, typeof ServerResponse>,
): SocketIoServer {
    io = new SocketIoServer(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN?.split("|"),
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.use(socketAuth);
    io.use(socketChatValidatePermission);
    io.on("connection", socketConnection);

    return io;
}
