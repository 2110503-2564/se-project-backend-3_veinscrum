import * as express from "express";
import { getMe, login, register, logout } from "../controllers/auth.js";
import { protect } from "../middleware/auth.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/logout", protect, logout);
export { router as authRouter };
