import type mongoose from "mongoose";
import type { Document } from "mongoose";
import { Message } from "./Message";

interface Chat extends Document<mongoose.Types.ObjectId> {
    interviewSession: mongoose.Types.ObjectId;
    messages: mongoose.Types.DocumentArray<Message>;
}
