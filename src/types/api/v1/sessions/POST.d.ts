import { InterviewSession } from "@/types/InterviewSession";
import { RequestWithAuth } from "@/types/Request";

export interface POSTRegisterInterviewSessionRequest extends RequestWithAuth {
    body: Pick<InterviewSession, "company" | "user" | "date">;
}
