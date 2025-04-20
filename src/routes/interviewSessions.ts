import {
    createInterviewSession,
    deleteInterviewSession,
    getInterviewSession,
    getInterviewSessions,
    updateInterviewSession,
} from "@/controllers/interviewSessions";
import { authorize, protect } from "@/middleware/auth";
import { Router } from "express";

const router = Router({ mergeParams: true });

router
    .route("/")
    .get(protect, authorize("admin"), getInterviewSessions)
    .post(
        protect,
        authorize("admin", "user", "company"),
        createInterviewSession,
    );

router
    .route("/:id")
    .get(protect, getInterviewSession)
    .put(protect, authorize("admin", "user", "company"), updateInterviewSession)
    .delete(
        protect,
        authorize("admin", "user", "company"),
        deleteInterviewSession,
    );

export { router as interviewSessionsRouter };
