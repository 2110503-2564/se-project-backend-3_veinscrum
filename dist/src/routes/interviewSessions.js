import {
    createInterviewSession,
    deleteInterviewSession,
    getInterviewSession,
    getInterviewSessions,
    updateInterviewSession,
} from "../controllers/interviewSessions.js";
import { authorize, protect } from "../middleware/auth.js";
import { Router } from "express";
const router = Router({ mergeParams: true });
router
    .route("/")
    .get(protect, getInterviewSessions)
    .post(protect, authorize("admin", "user"), createInterviewSession);
router
    .route("/:id")
    .get(protect, getInterviewSession)
    .put(protect, authorize("admin", "user"), updateInterviewSession)
    .delete(protect, authorize("admin", "user"), deleteInterviewSession);
export { router as interviewSessionsRouter };
