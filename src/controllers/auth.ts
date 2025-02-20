import { MongooseError } from "mongoose";
import { UserModel } from "../models/User";
import { NextFunction, Response, Request } from "express";
import { AuthRequest } from "../types/Request";
import { User } from "../types/User";

const sendTokenResponse = (user: User, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();

    if (!process.env.JWT_COOKIE_EXPIRE) {
        throw new Error("JWT_COOKIE_EXPIRE is not defined in .env file");
    }

    const options = {
        expires: new Date(
            Date.now() +
                Number(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000,
        ),
        httpOnly: true,
        secure: false,
    };

    if (process.env.NODE_ENV === "production") options.secure = true;

    res.status(statusCode)
        .cookie("token", token, options)
        .json({ success: true, token });
};

/// @desc     Register user
/// @route    POST /api/vl/auth/register
/// @access   Public
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { name, email, password, role } = req.body as AuthRequest["body"];

        const user = await UserModel.create({
            name,
            email,
            password,
            role,
        });

        const token = user.getSignedJwtToken();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        if (!(err instanceof MongooseError)) return;

        res.status(400).json({ success: false });
        console.error(err.stack);
    }
};

/// @desc     Login user
/// @route    POST /api/v1/auth/login
/// @access   Public
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { email, password } = req.body as AuthRequest["body"];

        if (!email || !password) {
            res.status(400).json({
                success: false,
                msg: "Please provide email and password",
            });

            return;
        }

        const user = await UserModel.findOne({ email }).select("+password");

        if (!user) {
            res.status(400).json({
                success: false,
                msg: "Invalid credentials",
            });

            return;
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            res.status(401).json({
                success: false,
                msg: "Invalid credentials",
            });

            return;
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

/// @desc     Get current logged in user
/// @route    GET /api/v1/auth/me
/// @access   Private
export const getMe = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = req.body as AuthRequest["body"];

    console.log(req);

    const user = await UserModel.findById(id);

    res.status(200).json({ success: true, data: user });
};
