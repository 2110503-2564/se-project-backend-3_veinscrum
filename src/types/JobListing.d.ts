import { Document } from "mongoose";

interface JobListing extends Document {
    company: ObjectId;
    image:string;
    jobTitle: string;
    description: string;
    createdAt: Date;
}