import { ChatSocketEvent } from "@/constants/ChatSocketEvent";
import { ChatModel } from "@/models/Chat";
import { io } from "@/socket/socket";
import { PUTChatRequest } from "@/types/api/v1/chats/PUT";
import { RequestWithAuth } from "@/types/Request";
import { NextFunction, Request, Response } from "express";

/// @desc     Update Chat Message (authentication required)
/// @route    PUT /api/v1/chat/:interviewSessionId
/// @access   Protected
export async function updateChatMessage(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const request = req as PUTChatRequest;
        const { id: userId } = request.user;

        const chat = await ChatModel.findOne({
            interviewSession: request.params.interviewSessionId,
        });

        if (!chat) {
            res.status(404).json({
                success: false,
                error: "Chat not found",
            });

            return;
        }

        const message = chat.messages.id(request.params.messageId);

        if (!message) {
            res.status(404).json({
                success: false,
                error: "Message not found",
            });

            return;
        }

        if (String(userId) !== String(message.sender)) {
            res.status(403).json({
                success: false,
                error: "You do not have permission to update this message",
            });

            return;
        }

        message.content = request.body.content || message.content;

        const updatedChat = await chat.save();

        io.to(request.params.interviewSessionId).emit(
            ChatSocketEvent.ChatUpdated,
            {
                ...message.toObject(),
                sender: request.user,
            },
        );

        res.status(200).json({ success: true, data: updatedChat });
    } catch (err) {
        next(err);
    }
}

/// @desc     Delete Chat Message (authentication required)
/// @route    DELETE /api/v1/chat/:interviewSessionId
/// @access   Protected
export async function deleteChatMessage(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const request = req as RequestWithAuth;
        const { id: userId } = request.user;

        const chat = await ChatModel.findOne({
            interviewSession: request.params.interviewSessionId,
        });

        if (!chat) {
            res.status(404).json({
                success: false,
                error: "Chat not found",
            });

            return;
        }

        const message = chat.messages.id(request.params.messageId);

        if (!message) {
            res.status(404).json({
                success: false,
                error: "Message not found",
            });

            return;
        }

        if (String(userId) !== String(message.sender)) {
            res.status(403).json({
                success: false,
                error: "You do not have permission to delete this message",
            });

            return;
        }

        const messageId = message._id;

        await message.deleteOne();
        await chat.save();

        io.to(request.params.interviewSessionId).emit(
            ChatSocketEvent.ChatDeleted,
            {
                messageId,
            },
        );

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
}
