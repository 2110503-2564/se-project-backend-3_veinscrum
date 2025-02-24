import * as mongoose from "mongoose";
import { Company } from "../types/Company";
import "./InterviewSession";

const CompanySchema = new mongoose.Schema<Company>(
    {
        name: {
            type: String,
            required: [true, "Please add a name"],
            unique: true,
            trim: true,
            maxlength: [50, "Name can not be more than 50 characters"],
        },
        address: {
            type: String,
            required: [true, "Please add an address"],
        },
        website: {
            type: String,
            match: [
                /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
                "Please use a valid URL with HTTP or HTTPS",
            ],
        },
        description: {
            type: String,
            required: [true, "Please add a description"],
        },
        tel: {
            type: String,
            required: [true, "Please add a phone number"],
            match: [
                /^\d{3}-\d{3}-\d{4}$/,
                "Please add a valid phone number in the format XXX-XXX-XXXX",
            ],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

CompanySchema.virtual("sessions", {
    ref: "InterviewSession",
    localField: "_id",
    foreignField: "company",
    justOne: false,
});

export const CompanyModel = mongoose.model<Company>("Company", CompanySchema);
