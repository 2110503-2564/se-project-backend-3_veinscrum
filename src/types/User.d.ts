import mongoose, { Document } from "mongoose";

interface User extends Document {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    tel: string;
    role: "user" | "admin" | "company";
    company: ObjectId;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    createdAt: Date;
    getSignedJwtToken: () => string;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
}
