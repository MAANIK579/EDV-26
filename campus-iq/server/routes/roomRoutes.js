import express from 'express';
import { getRooms, updateRoomStatus, uploadRoomSchedule } from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authMiddleware, getRooms);
router.put('/schedule', authMiddleware, upload.single('schedule'), uploadRoomSchedule);
router.patch('/:id', authMiddleware, updateRoomStatus);

export default router;
