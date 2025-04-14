import { Document } from "mongoose";

interface Company extends Document {
    name: string;
    address: string;
    website: string;
    description: string;
    tel: string;
    logo: Nullable<string>;
    owner: mongoose.Types.ObjectId;
}
