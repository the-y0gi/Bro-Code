import { Router } from "express";
import { upload } from '../middleware/cloudinaryUpload.js';
import * as userControllers  from "../controllers/user.controller.js";
import { jwtMiddleWare } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/register', upload.single('image'), userControllers.userRegister );
router.post('/login', userControllers.userLogin);
router.get('/logout', userControllers.userLogout);

router.post('/send-otp', userControllers.sendOtp);
router.post('/verify-otp', userControllers.verifyOtp);
router.post('/reset-password', userControllers.resetPassword);

router.get('/',userControllers.home );

router.put('/update-profile' , upload.single('profileImage'),jwtMiddleWare , userControllers.updateUserProfile);
router.put('/change-password', jwtMiddleWare, userControllers.changePassword);


export default router;