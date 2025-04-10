import * as mongoose from "mongoose";
import { JobListing } from "@/types/JobListing";

const JobListingSchema = new mongoose.Schema<JobListing>({
    company:{
        type: mongoose.Schema.Types.ObjectId
    },
    jobTitle:{
        type: String
    },
    description:{
        type: String
    },
    requirement:{
        type: String
    },
    contactDetail:{
        type: String
    },
    createdAt: {
        type: Date
    }
})

export const JobListingModel = mongoose.model("JobListing", JobListingSchema);