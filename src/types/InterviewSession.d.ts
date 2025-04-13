import mongoose, { Document } from "mongoose";

interface InterviewSession extends Document {
    company: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    date: Date;
    createdAt: Date;
}
