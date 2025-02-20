import * as mongoose from "mongoose";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

import { SignOptions } from "jsonwebtoken";
import { User } from "../types/User";

const UserSchema = new mongoose.Schema<User>({
    name: {
        type: String,
        required: [true, "Please add a name"],
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please add a valid email",
        ],
    },
    tel: {
        type: String,
        match: [
            /^(\+?0?1\s?)?(\d{3}|\(\d{3}\))([\s-./]?)(\d{3})([\s-./]?)(\d{4})$/,
            "Please add a valid phone number",
        ],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: 6,
        select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

UserSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getSignedJwtToken = function () {
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRE) {
        throw new Error("JWT_SECRET and JWT_EXPIRE must be defined");
    }

    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE as SignOptions["expiresIn"],
    });
};

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export const UserModel = mongoose.model("User", UserSchema);
