import express from 'express';
import userRoutes from './routes/user.routes.js';
import userAuth from './routes/auth.routes.js';
import group from './routes/group.routes.js';
import userMessage from './routes/message.routes.js';
import userRequest from './routes/request.routes.js';
import mediaUpload from './routes/upload.routes.js'
import cors from 'cors';
import multer from 'multer';


const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.use('/auth' , userAuth );
app.use('/user' , userRoutes );
app.use('/request' ,userRequest );
app.use('/groups', group);
app.use('/message', userMessage);
app.use('/media' ,mediaUpload );
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size exceeds the 10MB limit' });
      }
    }
    next(err);
  });



export default app; 