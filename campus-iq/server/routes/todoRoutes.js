import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getTodos, createTodo, toggleTodo, deleteTodo } from '../controllers/todoController.js';

const router = express.Router();

// All todo routes require authentication
router.use(requireAuth);

router.get('/', getTodos);
router.post('/', createTodo);
router.patch('/:id', toggleTodo);
router.delete('/:id', deleteTodo);

export default router;
