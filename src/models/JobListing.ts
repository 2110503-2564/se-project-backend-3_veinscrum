import * as mongoose from "mongoose";
import { JobListing } from "@/types/JobListing";

const JobListingSchema = new mongoose.Schema<JobListing>({
    company:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    image:{
        type: String,
    },
    jobTitle:{
        type: String,
        required: [true, "Please add job title"],
    },
    description:{
        type: mongoose.Schema.Types.Mixed,
        required: [true, "Please add description"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

export const JobListingModel = mongoose.model("JobListing", JobListingSchema);