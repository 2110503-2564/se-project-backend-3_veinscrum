import { getMe, login, logout, register } from "@/controllers/auth";
import { protect } from "@/middleware/auth";
import * as express from "express";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/logout", protect, logout);

export { router as authRouter };
