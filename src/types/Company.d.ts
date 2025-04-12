import { Document } from "mongoose";

interface Company extends Document {
    name: string;
    address: string;
    website: string;
    description: string;
    tel: string;
    owner: ObjectId;
}
