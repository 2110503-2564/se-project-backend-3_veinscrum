import type { Message } from "@/types/Message";
import type { RequestWithAuth } from "@/types/Request";

export interface PUTChatRequest extends RequestWithAuth {
    body: Pick<Message, "content">;
    params: {
        interviewSessionId: string;
        messageId: string;
    };
}
