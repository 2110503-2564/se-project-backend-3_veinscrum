export interface DELETEChatRequest extends RequestWithAuth {
    params: {
        interviewSessionId: string;
        messageId: string;
    };
}
