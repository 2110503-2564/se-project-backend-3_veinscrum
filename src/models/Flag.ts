import { Flag } from "@/types/models/Flag";
import * as mongoose from "mongoose";

const FlagSchema = new mongoose.Schema<Flag>({
    jobListing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobListing",
        required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export const FlagModel = mongoose.model<Flag>("Flag", FlagSchema);
