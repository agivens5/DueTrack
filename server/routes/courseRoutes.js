const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', (req, res) => {
    db.all('SELECT * FROM courses', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/', (req, res) => {
    const { course_name, instructor, semester } = req.body;

    db.run(
        'INSERT INTO courses (course_name, instructor, semester) VALUES (?, ?, ?)',
        [course_name, instructor, semester],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.json({
                course_id: this.lastID,
                course_name,
                instructor,
                semester
            });
        }
    );
});

module.exports = router;