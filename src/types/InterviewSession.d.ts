import { Document } from "mongoose";

interface InterviewSession extends Document {
    jobListing: ObjectId;
    user: ObjectId;
    date: Date;
    createdAt: Date;
}
