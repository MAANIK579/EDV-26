import express from 'express';
import { getPlacements, createPlacement, deletePlacement, toggleApplication } from '../controllers/placementController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all placements (public to authenticated users)
router.get('/', authMiddleware, getPlacements);

// Create a placement (Admin only logic handled in controller)
router.post('/', authMiddleware, createPlacement);

// Delete a placement (Admin only logic handled in controller)
router.delete('/:id', authMiddleware, deletePlacement);

// Apply/Withdraw for a placement (Student only logic handled in controller)
router.post('/:id/apply', authMiddleware, toggleApplication);

export default router;
