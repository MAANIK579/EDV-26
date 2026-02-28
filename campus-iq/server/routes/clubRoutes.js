import express from 'express';
import { getClubs, createClub, deleteClub, toggleClubMembership, getClubMembers, updateMemberRole } from '../controllers/clubController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getClubs);
router.post('/', authMiddleware, createClub); // Note: Admin check could go here, but authMiddleware ensures user exists
router.delete('/:id', authMiddleware, deleteClub);
router.post('/:id/toggle', authMiddleware, toggleClubMembership);

// Admin member management routes
router.get('/:id/members', authMiddleware, getClubMembers);
router.patch('/:id/members/:studentId', authMiddleware, updateMemberRole);

export default router;
