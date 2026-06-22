const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', (req, res) => {
    db.all('SELECT * FROM assignments', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/', (req, res) => {
    const { course_id, title, description, due_date, priority, status } = req.body;

    db.run(
        `INSERT INTO assignments 
        (course_id, title, description, due_date, priority, status) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [course_id, title, description, due_date, priority, status],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.json({
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

module.exports = router;