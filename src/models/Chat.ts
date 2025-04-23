import type { Chat } from "@/types/models/Chat";
import type { Message } from "@/types/models/Message";
import * as mongoose from "mongoose";

const MessageSchema = new mongoose.Schema<Message>({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const ChatSchema = new mongoose.Schema<Chat>({
    interviewSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewSession",
        required: [true, "Please add interview session"],
    },
    messages: [MessageSchema],
});

export const ChatModel = mongoose.model<Chat>("Chat", ChatSchema);
