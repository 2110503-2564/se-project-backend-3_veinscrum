import { deleteChatMessage, updateChatMessage } from "@/controllers/chats";
import { authorize, protect } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router
    .route("/:interviewSessionId/:messageId")
    .put(protect, authorize("user", "company"), updateChatMessage)
    .delete(protect, authorize("user", "company"), deleteChatMessage);

export { router as chatsRouter };
