import { Document } from "mongoose";

interface InterviewSession extends Document {
    jobListing: ObjectId;
    company: ObjectId;
    user: ObjectId;
    date: Date;
    createdAt: Date;
}
