const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all assignments
router.get('/', (req, res) => {
    db.all('SELECT * FROM assignments', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET one assignment by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM assignments WHERE assignment_id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Assignment not found' });

        res.json(row);
    });
});

// POST create assignment
router.post('/', (req, res) => {
    const { course_id, title, description, due_date, priority, status } = req.body;

    if (!title || !due_date) {
        return res.status(400).json({ error: 'Title and due date are required' });
    }

    db.run(
        `INSERT INTO assignments 
        (course_id, title, description, due_date, priority, status) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [course_id, title, description, due_date, priority, status],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
                assignment_id: this.lastID,
                course_id,
                title,
                description,
                due_date,
                priority,
                status
            });
        }
    );
});

// PUT update assignment
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { course_id, title, description, due_date, priority, status } = req.body;

    if (!title || !due_date) {
        return res.status(400).json({ error: 'Title and due date are required' });
    }

    db.run(
        `UPDATE assignments 
         SET course_id = ?, title = ?, description = ?, due_date = ?, priority = ?, status = ?
         WHERE assignment_id = ?`,
        [course_id, title, description, due_date, priority, status, id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Assignment not found' });

            res.json({
                assignment_id: Number(id),
                course_id,
                title,
                description,
                due_date,
                priority,
                status
            });
        }
    );
});

// DELETE assignment
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM assignments WHERE assignment_id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Assignment not found' });

        res.json({ message: 'Assignment deleted successfully' });
    });
});

module.exports = router;