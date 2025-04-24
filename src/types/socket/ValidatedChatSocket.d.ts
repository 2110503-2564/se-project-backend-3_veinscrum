import type { InterviewSession } from "../models/InterviewSession";
import type { SocketWithAuth } from "./SocketWithAuth";

interface ValidatedChatSocket extends SocketWithAuth {
    data: SocketWithAuth["data"] & {
        interviewSession: InterviewSession & {
            jobListing: JobListing & { company: Company };
        } & Required<{ _id: mongoose.Types.ObjectId }>;
    };
}
