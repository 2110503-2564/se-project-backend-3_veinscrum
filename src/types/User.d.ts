import { Document } from "mongoose";

interface User extends Document {
    name: string;
    email: string;
    tel?: string;
    role: "user" | "admin";
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    createdAt: Date;
    getSignedJwtToken: () => string;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
}
