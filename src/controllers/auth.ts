import { NextFunction, Request, Response } from "express";
import { POSTUserLoginRequest } from "@/types/api/v1/auth/login/POST";
import { POSTUserRegisterRequest } from "@/types/api/v1/auth/register/POST";
import { RequestWithAuth } from "@/types/Request";
import { UserModel } from "@/models/User";
import { User } from "@/types/User";

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
        const request = req as POSTUserRegisterRequest;

        const { name, email, tel, password, role } = request.body;

        const user = await UserModel.create({
            name,
            email,
            password,
            tel,
            role,
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
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
        const request = req as POSTUserLoginRequest;

        const { email, password } = request.body;

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
        next(err);
    }
};

/// @desc     Logout user
/// @route    GET /api/v1/auth/logout
/// @access   Private
export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({ success: true, data: {} });
};

/// @desc     Get current logged in user
/// @route    GET /api/v1/auth/me
/// @access   Private
export const getMe = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const request = req as RequestWithAuth;
    const { id } = request.user;

    const user = await UserModel.findById(id);

    res.status(200).json({ success: true, data: user });
};
