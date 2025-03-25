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
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.js";
export const protect = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        let token;
        const request = req;
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
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            request.user = yield UserModel.findById(decoded.id);
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
    });
export const authorize = (...roles) => {
    return (req, res, next) => {
        const request = req;
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
