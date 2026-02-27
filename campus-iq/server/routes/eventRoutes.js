import express from 'express';
import { getAllEvents, createEvent, deleteEvent, toggleRsvp } from '../controllers/eventController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllEvents);
router.post('/', authMiddleware, createEvent);
router.delete('/:id', authMiddleware, deleteEvent);
router.post('/:id/rsvp', authMiddleware, toggleRsvp);

export default router;
