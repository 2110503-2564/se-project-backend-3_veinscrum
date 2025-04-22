import { Message } from "@/types/Message";
import { RequestWithAuth } from "@/types/Request";

export interface PUTChatRequest extends RequestWithAuth {
    body: Pick<Message, "content">;
    params: {
        interviewSessionId: string;
        messageId: string;
    };
}
