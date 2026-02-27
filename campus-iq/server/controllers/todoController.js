import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { todos } from '../db/schema.js';

// Get all todos for a student
export const getTodos = (req, res) => {
    try {
        const studentId = req.user.id;
        const userTodos = db.select().from(todos).where(eq(todos.studentId, studentId)).orderBy(todos.createdAt).all();
        res.json(userTodos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
};

// Create a new todo
export const createTodo = (req, res) => {
    try {
        const studentId = req.user.id;
        const { text } = req.body;

        if (!text) return res.status(400).json({ error: 'Text is required' });

        const newTodo = db.insert(todos).values({
            studentId,
            text
        }).returning().all();

        res.status(201).json(newTodo[0]);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Failed to create todo' });
    }
};

// Toggle a todo (done/undone)
export const toggleTodo = (req, res) => {
    try {
        const studentId = req.user.id;
        const todoId = parseInt(req.params.id);
        const { done } = req.body;

        const updatedTodo = db.update(todos)
            .set({ done })
            .where(and(eq(todos.id, todoId), eq(todos.studentId, studentId)))
            .returning().all();

        if (updatedTodo.length === 0) {
            return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }

        res.json(updatedTodo[0]);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ error: 'Failed to update todo' });
    }
};

// Delete a todo
export const deleteTodo = (req, res) => {
    try {
        const studentId = req.user.id;
        const todoId = parseInt(req.params.id);

        const deletedTodo = db.delete(todos)
            .where(and(eq(todos.id, todoId), eq(todos.studentId, studentId)))
            .returning().all();

        if (deletedTodo.length === 0) {
            return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }

        res.json({ message: 'Todo deleted successfully', id: todoId });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Failed to delete todo' });
    }
};
