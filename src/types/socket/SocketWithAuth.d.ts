import type { Socket } from "socket.io";
import type { User } from "../models/User";

export interface SocketWithAuth extends Socket {
    data: {
        user: User;
    };
}
