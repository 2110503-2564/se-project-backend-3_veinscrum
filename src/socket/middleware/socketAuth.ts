import { UserModel } from "@/models/User";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { ExtendedError, Socket } from "socket.io";

export const socketAuth = async (
    socket: Socket,
    next: (err?: ExtendedError) => void,
) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error("No token provided"));
    }

    if (!process.env.JWT_SECRET)
        throw new Error("JWT_SECRET must be defined in .env file");

    try {
        const decoded: JwtPayload = jwt.verify(
            token,
            process.env.JWT_SECRET,
        ) as jwt.JwtPayload;

        if (!decoded.id) {
            return next(new Error("Invalid token payload"));
        }

        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return next(new Error("User not found"));
        }

        socket.data.user = user;
        next();
    } catch {
        next(new Error("Invalid token"));
    }
};
