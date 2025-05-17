
import express from 'express';
import { upload } from '../middleware/cloudinaryUpload.js';
import { uploadController, createMediaMessage } from '../controllers/upload.controller.js';

const router = express.Router();

router.post('/upload-file',upload.single('file') , uploadController);
router.post("/media-file", createMediaMessage);

export default router;
