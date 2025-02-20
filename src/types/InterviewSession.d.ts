import { Document, ObjectId } from "mongoose";

interface InterviewSession extends Document {
    company: ObjectId;
    user: ObjectId;
    date: Date;
    createdAt: Date;
}
