import * as mongoose from "mongoose";
import { JobListing } from "@/types/JobListing";

const JobListingSchema = new mongoose.Schema<JobListing>({
    company:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    jobTitle:{
        type: String,
        required: [true, "Please add job title"],
    },
    description:{
        type: String,
        required: [true, "Please add description"],
    },
    requirement:{
        type: String,
        required: [true, "Please add requirement"],
    },
    contactDetail:{
        type: String,
        required: [true, "Please add contact detail"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

export const JobListingModel = mongoose.model("JobListing", JobListingSchema);