import { Router } from "express";
import { jwtMiddleWare } from "../middleware/auth.middleware.js";
import * as allUsersData  from "../controllers/allUsers.controller.js";

import { acceptedFriends } from "../controllers/acceptedFriends.controller.js";


const router = Router();

router.get('/all-users', jwtMiddleWare , allUsersData.getAllUsers);
router.get("/friends" , jwtMiddleWare , acceptedFriends);


export default router;