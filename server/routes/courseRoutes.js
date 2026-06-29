const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all courses
router.get('/', (req, res) => {
    db.all('SELECT * FROM courses', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET one course by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM courses WHERE course_id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Course not found' });

        res.json(row);
    });
});

// POST create course
router.post('/', (req, res) => {
    const { course_name, instructor, semester } = req.body;

    if (!course_name) {
        return res.status(400).json({ error: 'Course name is required' });
    }

    db.run(
        'INSERT INTO courses (course_name, instructor, semester) VALUES (?, ?, ?)',
        [course_name, instructor, semester],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
                course_id: this.lastID,
                course_name,
                instructor,
                semester
            });
        }
    );
});

// PUT update course
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { course_name, instructor, semester } = req.body;

    if (!course_name) {
        return res.status(400).json({ error: 'Course name is required' });
    }

    db.run(
        'UPDATE courses SET course_name = ?, instructor = ?, semester = ? WHERE course_id = ?',
        [course_name, instructor, semester, id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Course not found' });

            res.json({
                course_id: Number(id),
                course_name,
                instructor,
                semester
            });
        }
    );
});

// DELETE course
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM courses WHERE course_id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Course not found' });

        res.json({ message: 'Course deleted successfully' });
    });
});

module.exports = router;