import { Router } from "express";
import {
    getInterviewSessions,
    getInterviewSession,
    addInterviewSession,
    updateInterviewSession,
    deleteInterviewSession,
} from "@/controllers/interviewSessions";
import { protect, authorize } from "@/middleware/auth";

const router = Router({ mergeParams: true });

router
    .route("/")
    .get(protect, getInterviewSessions)
    .post(protect, authorize("admin", "user"), addInterviewSession);

router
    .route("/:id")
    .get(protect, getInterviewSession)
    .put(protect, authorize("admin", "user"), updateInterviewSession)
    .delete(protect, authorize("admin", "user"), deleteInterviewSession);

export { router as interviewSessionsRouter };
