const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

// GET all todos for authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.userId }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new todo
router.post('/', auth, async (req, res) => {
    try {
        const todo = new Todo({
            title: req.body.title,
            user: req.user.userId
        });
        const newTodo = await todo.save();
        res.status(201).json(newTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE a todo
router.patch('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user.userId });
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        
        if (req.body.title !== undefined) {
            todo.title = req.body.title;
        }
        if (req.body.completed !== undefined) {
            todo.completed = req.body.completed;
        }
        
        const updatedTodo = await todo.save();
        res.json(updatedTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a todo
router.delete('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user.userId });
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        
        await todo.deleteOne();
        res.json({ message: 'Todo deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
