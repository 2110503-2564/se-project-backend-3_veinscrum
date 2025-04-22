import type mongoose from "mongoose";
import type { Document } from "mongoose";

interface Company extends Document<mongoose.Types.ObjectId> {
    name: string;
    address: string;
    website: string;
    description: string;
    tel: string;
    logo: Nullable<string>;
    owner: mongoose.Types.ObjectId;
}
