import { InterviewSession } from "@/types/InterviewSession";
import { RequestWithAuth } from "@/types/Request";
import { User } from "@/types/User";

export interface POSTRegisterInterviewSessionRequest extends RequestWithAuth {
    body: Pick<InterviewSession, "company" | "user" | "date">;
}
