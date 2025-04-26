import { ChatSocketEvent } from "@/constants/ChatSocketEvent";
import { ChatModel } from "@/models/Chat";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { Company } from "@/types/models/Company";
import { InterviewSession } from "@/types/models/InterviewSession";
import { JobListing } from "@/types/models/JobListing";
import { SocketWithAuth } from "@/types/socket/SocketWithAuth";
import { ValidatedChatSocket } from "@/types/socket/ValidatedChatSocket";
import { convertToSocketHandShakeQuery } from "@/utils/convertToSocketHandshakeQuery";
import mongoose from "mongoose";
import { ExtendedError } from "socket.io";

export const socketChatValidatePermission = async (
    socket: SocketWithAuth,
    next: (err?: ExtendedError) => void,
) => {
    try {
        const interviewSessionId = convertToSocketHandShakeQuery(
            socket.handshake.query,
        );

        const interviewSession = await InterviewSessionModel.findById(
            interviewSessionId,
        )
            .populate([
                {
                    path: "jobListing",
                    populate: {
                        path: "company",
                        model: "Company",
                    },
                },
            ])
            .lean<
                InterviewSession & {
                    jobListing: JobListing & { company: Company };
                } & Required<{ _id: mongoose.Types.ObjectId }>
            >();

        if (!interviewSession) {
            socket.disconnect();
            return;
        }

        if (
            String(socket.data.user._id) !== String(interviewSession.user) &&
            String(socket.data.user._id) !==
                String(interviewSession.jobListing.company.owner)
        ) {
            socket.emit(ChatSocketEvent.ChatError, {
                error: "You do not have permission to interact with this chat",
            });
            socket.disconnect();
            return;
        }

        if (!interviewSession.chat) {
            const chat = await ChatModel.create({
                interviewSession: interviewSession._id,
                messages: [],
            });

            const updatedSession = await InterviewSessionModel.findOneAndUpdate(
                { _id: interviewSession._id, chat: { $exists: false } },
                { chat: chat._id },
                { new: true },
            );

            if (updatedSession) {
                interviewSession.chat = chat._id;
            } else {
                await ChatModel.findByIdAndDelete(chat._id);
                const latestSession = await InterviewSessionModel.findById(
                    interviewSession._id,
                ).lean();

                interviewSession.chat = latestSession?.chat ?? null;
            }
        }

        (socket as ValidatedChatSocket).data.interviewSession =
            interviewSession;

        next();
    } catch (error) {
        console.error(
            "An error occurred during socketChatValidatePermission:",
            error,
        );
        socket.emit(ChatSocketEvent.ChatError, {
            error: "An unexpected error occurred.",
        });

        socket.disconnect();
    }
};
