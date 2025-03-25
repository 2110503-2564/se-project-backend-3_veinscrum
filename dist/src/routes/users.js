import * as express from "express";
import { authorize, protect } from "../middleware/auth.js";
import { getInterviewSessionsByUser } from "../controllers/interviewSessions.js";
import { getUsers } from "../controllers/users.js";
const router = express.Router();
router.get("/", protect, authorize("admin"), getUsers);
router.get(
    "/:id/sessions",
    protect,
    authorize("user", "admin"),
    getInterviewSessionsByUser,
);
export { router as usersRouter };
