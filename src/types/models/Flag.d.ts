import type mongoose from "mongoose";
import type { Document } from "mongoose";

interface Flag extends Document<mongoose.Types.ObjectId> {
    jobListing: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
}
