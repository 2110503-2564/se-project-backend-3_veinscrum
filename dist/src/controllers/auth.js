var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next(),
            );
        });
    };
import { UserModel } from "../models/User.js";
const sendTokenResponse = (user, statusCode, res) => {
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
export const register = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        try {
            const request = req;
            const { name, email, tel, password, role } = request.body;
            const user = yield UserModel.create({
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
    });
/// @desc     Login user
/// @route    POST /api/v1/auth/login
/// @access   Public
export const login = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        try {
            const request = req;
            const { email, password } = request.body;
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    msg: "Please provide email and password",
                });
                return;
            }
            const user = yield UserModel.findOne({ email }).select("+password");
            if (!user) {
                res.status(400).json({
                    success: false,
                    msg: "Invalid credentials",
                });
                return;
            }
            const isMatch = yield user.matchPassword(password);
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
    });
/// @desc     Logout user
/// @route    GET /api/v1/auth/logout
/// @access   Private
export const logout = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        res.cookie("token", "none", {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });
        res.status(200).json({ success: true, data: {} });
    });
/// @desc     Get current logged in user
/// @route    GET /api/v1/auth/me
/// @access   Private
export const getMe = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const request = req;
        const { id } = request.user;
        const user = yield UserModel.findById(id);
        res.status(200).json({ success: true, data: user });
    });
