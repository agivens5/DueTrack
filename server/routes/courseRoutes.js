const express = require('express');

const db = require('../models/db');

const requireAuth = require(
    '../middleware/requireAuth'
);

const router = express.Router();

router.use(requireAuth);

// GET all courses for the logged-in user
router.get('/', (req, res) => {
    const userId =
        req.session.user.user_id;

    db.all(
        `
            SELECT
                course_id,
                course_name,
                instructor,
                semester
            FROM courses
            WHERE user_id = ?
            ORDER BY course_name COLLATE NOCASE
        `,
        [userId],
        (error, courses) => {
            if (error) {
                return res.status(500).json({
                    error:
                        'Unable to load courses.'
                });
            }

            return res.json(courses);
        }
    );
});

// GET one course owned by the logged-in user
router.get('/:id', (req, res) => {
    const courseId = Number(
        req.params.id
    );

    const userId =
        req.session.user.user_id;

    if (!isValidId(courseId)) {
        return res.status(400).json({
            error:
                'A valid course ID is required.'
        });
    }

    db.get(
        `
            SELECT
                course_id,
                course_name,
                instructor,
                semester
            FROM courses
            WHERE course_id = ?
              AND user_id = ?
        `,
        [courseId, userId],
        (error, course) => {
            if (error) {
                return res.status(500).json({
                    error:
                        'Unable to load the course.'
                });
            }

            if (!course) {
                return res.status(404).json({
                    error:
                        'Course not found.'
                });
            }

            return res.json(course);
        }
    );
});

// POST create a course for the logged-in user
router.post('/', (req, res) => {
    const userId =
        req.session.user.user_id;

    const courseName = cleanText(
        req.body.course_name
    );

    const instructor = cleanOptionalText(
        req.body.instructor
    );

    const semester = cleanOptionalText(
        req.body.semester
    );

    if (!courseName) {
        return res.status(400).json({
            error:
                'Course name is required.'
        });
    }

    if (courseName.length > 100) {
        return res.status(400).json({
            error:
                'Course name must be 100 characters or fewer.'
        });
    }

    db.run(
        `
            INSERT INTO courses (
                user_id,
                course_name,
                instructor,
                semester
            )
            VALUES (?, ?, ?, ?)
        `,
        [
            userId,
            courseName,
            instructor,
            semester
        ],
        function (error) {
            if (error) {
                return res.status(500).json({
                    error:
                        'Unable to create the course.'
                });
            }

            return res.status(201).json({
                course_id: this.lastID,
                course_name: courseName,
                instructor,
                semester
            });
        }
    );
});

// PUT update a course owned by the logged-in user
router.put('/:id', (req, res) => {
    const courseId = Number(
        req.params.id
    );

    const userId =
        req.session.user.user_id;

    const courseName = cleanText(
        req.body.course_name
    );

    const instructor = cleanOptionalText(
        req.body.instructor
    );

    const semester = cleanOptionalText(
        req.body.semester
    );

    if (!isValidId(courseId)) {
        return res.status(400).json({
            error:
                'A valid course ID is required.'
        });
    }

    if (!courseName) {
        return res.status(400).json({
            error:
                'Course name is required.'
        });
    }

    if (courseName.length > 100) {
        return res.status(400).json({
            error:
                'Course name must be 100 characters or fewer.'
        });
    }

    db.run(
        `
            UPDATE courses
            SET
                course_name = ?,
                instructor = ?,
                semester = ?
            WHERE course_id = ?
              AND user_id = ?
        `,
        [
            courseName,
            instructor,
            semester,
            courseId,
            userId
        ],
        function (error) {
            if (error) {
                return res.status(500).json({
                    error:
                        'Unable to update the course.'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error:
                        'Course not found.'
                });
            }

            return res.json({
                course_id: courseId,
                course_name: courseName,
                instructor,
                semester
            });
        }
    );
});

// DELETE a course owned by the logged-in user
router.delete('/:id', (req, res) => {
    const courseId = Number(
        req.params.id
    );

    const userId =
        req.session.user.user_id;

    if (!isValidId(courseId)) {
        return res.status(400).json({
            error:
                'A valid course ID is required.'
        });
    }

    db.get(
        `
            SELECT course_id
            FROM courses
            WHERE course_id = ?
              AND user_id = ?
        `,
        [courseId, userId],
        (lookupError, course) => {
            if (lookupError) {
                return res.status(500).json({
                    error:
                        'Unable to delete the course.'
                });
            }

            if (!course) {
                return res.status(404).json({
                    error:
                        'Course not found.'
                });
            }

            db.serialize(() => {
                db.run(
                    `
                        DELETE FROM assignments
                        WHERE course_id = ?
                          AND user_id = ?
                    `,
                    [courseId, userId],
                    assignmentError => {
                        if (assignmentError) {
                            console.error(
                                'Unable to delete course assignments:',
                                assignmentError.message
                            );
                        }
                    }
                );

                db.run(
                    `
                        DELETE FROM courses
                        WHERE course_id = ?
                          AND user_id = ?
                    `,
                    [courseId, userId],
                    function (deleteError) {
                        if (deleteError) {
                            return res.status(500).json({
                                error:
                                    'Unable to delete the course.'
                            });
                        }

                        return res.json({
                            message:
                                'Course deleted successfully.'
                        });
                    }
                );
            });
        }
    );
});

function cleanText(value) {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

function cleanOptionalText(value) {
    const cleanedValue =
        cleanText(value);

    return cleanedValue || null;
}

function isValidId(value) {
    return (
        Number.isInteger(value) &&
        value > 0
    );
}

module.exports = router;