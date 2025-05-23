import { ChatSocketEvent } from "@/constants/ChatSocketEvent";
import { ChatModel } from "@/models/Chat";
import { io } from "@/socket/socket";
import type { ValidatedChatSocket } from "@/types/socket/ValidatedChatSocket";
import mongoose from "mongoose";

export const socketConnection = async (socket: ValidatedChatSocket) => {
    try {
        const interviewSession = socket.data.interviewSession;
        const roomId = String(interviewSession._id);

        console.log(`🟢 User connected: ${socket.data.user.name}`);
        socket.join(roomId);

        const chat = await ChatModel.findById(interviewSession.chat).populate(
            "messages.sender",
        );

        if (!chat) {
            socket.emit(ChatSocketEvent.ChatError, {
                error: "Chat not found",
            });

            socket.disconnect();
            return;
        }

        socket.emit(ChatSocketEvent.ChatHistory, chat.messages);

        socket.on(ChatSocketEvent.ChatMessage, async (msg: string) => {
            try {
                if (!msg || !msg.trim()) return;
                console.log(`💬 Message [${socket.data.user.name}]: ${msg}`);

                const _id = new mongoose.Types.ObjectId();

                const newMessage = {
                    _id,
                    sender: socket.data.user,
                    content: msg,
                    timestamp: new Date(),
                };

                await ChatModel.findByIdAndUpdate(interviewSession.chat, {
                    $push: { messages: newMessage },
                });

                io.to(roomId).emit(ChatSocketEvent.ChatMessage, newMessage);
            } catch (error) {
                console.error("Error handling ChatMessage event:", error);
                socket.emit(ChatSocketEvent.ChatError, {
                    error: "Failed to process the message. Please try again.",
                });
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔴 User disconnected: ${socket.id}`);
        });
    } catch (error) {
        console.error("Socket connection error:", error);

        socket.emit(ChatSocketEvent.ChatError, {
            error: "An unexpected error occurred. Please try again later.",
        });

        socket.disconnect();
    }
};
