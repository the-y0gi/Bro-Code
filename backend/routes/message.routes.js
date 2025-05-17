import { Router } from "express";
import { jwtMiddleWare } from "../middleware/auth.middleware.js";
import * as message from "../controllers/message.controller.js";

const router = Router();

router.post('/send-message' , jwtMiddleWare , message.messageSaveInDB);
router.get('/message-show' , jwtMiddleWare , message.messageShow);
router.patch("/edit-message/:messageId", jwtMiddleWare, message.editMessage);
router.delete("/delete-message/:messageId", jwtMiddleWare, message.deleteMessageForEveryone);
router.post("/delete-chat-history",jwtMiddleWare, message.deleteChatHistory);


export default router;