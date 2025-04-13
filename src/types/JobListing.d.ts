import { Document } from "mongoose";

interface JobListing extends Document {
    company: mongoose.Types.ObjectId;
    image:string;
    jobTitle: string;
    description: string;
    createdAt: Date;
}