import { Document } from "mongoose";

interface JobListing extends Document<mongoose.Types.ObjectId> {
    company: mongoose.Types.ObjectId;
    image: string;
    jobTitle: string;
    description: string;
    createdAt: Date;
}
