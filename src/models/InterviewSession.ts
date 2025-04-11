import { InterviewSession } from "@/types/InterviewSession";
import * as mongoose from "mongoose";

const InterviewSessionSchema = new mongoose.Schema<InterviewSession>({
    jobListing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobListing",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const InterviewSessionModel = mongoose.model<InterviewSession>(
    "InterviewSession",
    InterviewSessionSchema,
);
