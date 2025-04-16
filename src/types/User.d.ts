import mongoose, { Document } from "mongoose";

interface User extends Document<mongoose.Types.ObjectId> {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    tel: string;
    role: "user" | "admin" | "company";
    company: mongoose.Types.ObjectId;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    createdAt: Date;
    getSignedJwtToken: () => string;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
}
