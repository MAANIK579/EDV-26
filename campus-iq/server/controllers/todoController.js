import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { todos } from '../db/schema.js';

export const getTodos = async (req, res) => {
    try {
        const studentId = req.user.id;
        const userTodos = await db.select().from(todos).where(eq(todos.studentId, studentId)).orderBy(todos.createdAt);
        res.json(userTodos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
};

export const createTodo = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const newTodo = await db.insert(todos).values({ studentId, text }).returning();
        res.status(201).json(newTodo[0]);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Failed to create todo' });
    }
};

export const toggleTodo = async (req, res) => {
    try {
        const studentId = req.user.id;
        const todoId = parseInt(req.params.id);
        const { done } = req.body;

        const updatedTodo = await db.update(todos)
            .set({ done })
            .where(and(eq(todos.id, todoId), eq(todos.studentId, studentId)))
            .returning();

        if (updatedTodo.length === 0) {
            return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }
        res.json(updatedTodo[0]);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ error: 'Failed to update todo' });
    }
};

export const deleteTodo = async (req, res) => {
    try {
        const studentId = req.user.id;
        const todoId = parseInt(req.params.id);

        const deletedTodo = await db.delete(todos)
            .where(and(eq(todos.id, todoId), eq(todos.studentId, studentId)))
            .returning();

        if (deletedTodo.length === 0) {
            return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }
        res.json({ message: 'Todo deleted successfully', id: todoId });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Failed to delete todo' });
    }
};
