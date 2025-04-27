import { getInterviewSessionsByUser } from "@/controllers/interviewSessions";
import { authorize, protect } from "@/middleware/auth";
import * as express from "express";

const router = express.Router();

router.get(
    "/:id/sessions",
    protect,
    authorize("user", "admin"),
    getInterviewSessionsByUser,
);

export { router as usersRouter };
