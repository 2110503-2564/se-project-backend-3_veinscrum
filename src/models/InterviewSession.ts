import type { InterviewSession } from "@/types/models/InterviewSession";
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
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
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
