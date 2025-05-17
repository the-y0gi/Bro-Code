import { Router } from "express";
import { jwtMiddleWare } from "../middleware/auth.middleware.js";
import { upload } from '../middleware/cloudinaryUpload.js';
import * as group from "../controllers/group.controller.js";

const router = Router();


router.post("/create-group",upload.single('image'), jwtMiddleWare, group.groupCreated);
router.get('/groups-show' , jwtMiddleWare , group.groupMemberShow);
router.put('/add-member/:groupID' , jwtMiddleWare , group.groupAdminAddMember);
router.delete("/remove-member/:groupId/:userId", jwtMiddleWare, group.groupAdminRemoveMember);
router.delete("/delete-group/:groupId", jwtMiddleWare, group.groupDeletedByAdmin);
router.post('/exit' , jwtMiddleWare , group.groupExistByUser);


export default router;