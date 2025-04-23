import type mongoose from "mongoose";
import type { Document } from "mongoose";

interface User extends Document<mongoose.Types.ObjectId> {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    tel: string;
    role: "user" | "admin" | "company";
    company: Nullable<mongoose.Types.ObjectId>;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    createdAt: Date;
    getSignedJwtToken: () => string;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
}
