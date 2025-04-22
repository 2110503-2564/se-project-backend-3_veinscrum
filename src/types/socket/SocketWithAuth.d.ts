import { Socket } from "socket.io";
import { User } from "../models/User";

export interface SocketWithAuth extends Socket {
    data: {
        user: User;
    };
}
