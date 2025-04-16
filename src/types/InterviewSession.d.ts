import mongoose, { Document } from "mongoose";

interface InterviewSession extends Document<mongoose.Types.ObjectId> {
    jobListing: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    date: Date;
    createdAt: Date;
}
