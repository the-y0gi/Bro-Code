import { Router } from "express";
import { jwtMiddleWare } from "../middleware/auth.middleware.js";
import * as request from "../controllers/friend.controller.js";

const router = Router();

router.post("/send-request", jwtMiddleWare, request.sendFriendRequest);
router.post("/cancel-request" , jwtMiddleWare , request.cancelFriendRequest)
router.post("/accept-request", jwtMiddleWare, request.acceptFriendRequest);
router.post("/reject-request", jwtMiddleWare, request.rejectFriendRequest);
router.get("/show-request" , jwtMiddleWare , request.getFriendRequests);


export default router;