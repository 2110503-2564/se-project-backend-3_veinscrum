import jwt from "jsonwebtoken";

import { JwtPayload } from "jsonwebtoken";
import { UserModel } from "../models/User";
import { NextFunction, Request, Response } from "express";
import { User } from "../types/User";
import { AuthRequest } from "../types/Request";

export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    let token: string | undefined;

    if (!process.env.JWT_SECRET)
        throw new Error("JWT_SECRET must be defined in .env file");

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    )
        token = req.headers.authorization.split(" ")[1];

    if (!token) {
        res.status(401).json({
            success: false,
            msg: "Not authorize to access this route",
        });

        return;
    }

    try {
        const decoded: JwtPayload = jwt.verify(
            token,
            process.env.JWT_SECRET,
        ) as jwt.JwtPayload;

        (req as AuthRequest).user = (await UserModel.findById(
            decoded.id,
        )) as User;

        next();
    } catch (err) {
        if (!(err instanceof jwt.JsonWebTokenError)) return;

        console.error(err.stack);
        res.status(401).json({
            success: false,
            msg: "Not authorize to access this route",
        });

        return;
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as AuthRequest).user;

        if (!user) {
            res.status(401).json({
                success: false,
                msg: "Not authorize to access this route",
            });

            return;
        }

        if (!roles.includes(user.role)) {
            res.status(403).json({
                success: false,
                msg: `User role '${user.role}' is not authorized to access this route`,
            });
            return;
        }
        next();
    };
};
