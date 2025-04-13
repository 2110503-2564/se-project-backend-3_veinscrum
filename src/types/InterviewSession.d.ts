import { Document } from "mongoose";

interface InterviewSession extends Document {
    jobListing: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    date: Date;
    createdAt: Date;
}
