import express from 'express';
import { getNotifications, markNotificationRead, markAllRead } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.patch('/:id/read', authMiddleware, markNotificationRead);
router.patch('/read-all', authMiddleware, markAllRead);

export default router;
