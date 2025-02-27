import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { RequestWithAuth } from "@/types/Request";
import { UserModel } from "@/models/User";
import { User } from "@/types/User";

export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    let token: string | undefined;

    const request = req as RequestWithAuth;

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

        request.user = (await UserModel.findById(decoded.id)) as User;

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
        const request = req as RequestWithAuth;

        const user = request.user;

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
