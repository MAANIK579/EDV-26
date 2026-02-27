import express from 'express';
import { getRooms, updateRoomStatus } from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getRooms);
router.patch('/:id', authMiddleware, updateRoomStatus);

export default router;
