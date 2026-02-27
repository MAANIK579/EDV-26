import express from 'express';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcementController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAnnouncements);
router.post('/', authMiddleware, createAnnouncement);
router.delete('/:id', authMiddleware, deleteAnnouncement);

export default router;
