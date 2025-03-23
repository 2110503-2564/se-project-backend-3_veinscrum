import * as express from "express";
import { getMe, login, register, logout } from "@/controllers/auth";
import { authorize, protect } from "@/middleware/auth";
import { getInterviewSessionsByUser } from "@/controllers/interviewSessions";
import { getUsers } from "@/controllers/users";

const router = express.Router();

router.get("/", protect, authorize("admin"), getUsers);
router.get(
    "/:id/sessions",
    protect,
    authorize("user", "admin"),
    getInterviewSessionsByUser,
);

export { router as usersRouter };
