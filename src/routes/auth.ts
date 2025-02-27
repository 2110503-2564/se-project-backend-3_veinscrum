import * as express from "express";
import { getMe, login, register } from "@/controllers/auth";
import { protect } from "@/middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

export { router as authRouter };
