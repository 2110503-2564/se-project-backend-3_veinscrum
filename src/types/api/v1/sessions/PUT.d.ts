import type { InterviewSession } from "@/types/InterviewSession";
import type { RequestWithAuth } from "@/types/Request";

export interface PUTUpdateInterviewSessionRequest extends RequestWithAuth {
    body: Pick<InterviewSession, "company" | "user" | "date">;
}
