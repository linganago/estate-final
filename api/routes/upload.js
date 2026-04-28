import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mern_estate_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

router.post('/image', verifyToken, upload.single('image'), (req, res, next) => {
  try {
    res.json({ success: true, imageUrl: req.file.path });
  } catch (err) {
    next(err);
  }
});

export default router;
