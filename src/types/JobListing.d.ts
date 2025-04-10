import { Document } from "mongoose";

interface JobListing extends Document {
    company: ObjectId;
    jobTitle: string;
    description: string;
    requirement: string;
    contactDetail: string;
    createdAt: Date;
}