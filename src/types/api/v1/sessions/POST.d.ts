import type { InterviewSession } from "@/types/InterviewSession";
import type { RequestWithAuth } from "@/types/Request";

export interface POSTRegisterInterviewSessionRequest extends RequestWithAuth {
    body: Pick<InterviewSession, "jobListing" | "user" | "date">;
}
