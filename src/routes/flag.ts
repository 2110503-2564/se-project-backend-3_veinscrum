import { createFlag, deleteFlag, getFlags } from "@/controllers/flag";
import { authorize, protect } from "@/middleware/auth";
import * as express from "express";

const router = express.Router();

router.get("/", protect, authorize("admin", "company"), getFlags);
router.post("/", protect, authorize("admin", "company"), createFlag);
router.delete("/:id", protect, authorize("admin", "company"), deleteFlag);

export { router as flagRouter };
