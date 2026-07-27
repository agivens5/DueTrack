const express = require('express');

const db = require('../models/db');

const requireAuth = require(
    '../middleware/requireAuth'
);

const router = express.Router();

router.use(requireAuth);

// GET all assignments for the logged-in user
router.get('/', (req, res) => {
    const userId =
        req.session.user.user_id;

    db.all(
        `
            SELECT
                assignments.assignment_id,
                assignments.course_id,
                assignments.title,
                assignments.description,
                assignments.due_date,
                assignments.priority,
                assignments.status,
                assignments.created_at,
                courses.course_name
            FROM assignments
            LEFT JOIN courses
                ON assignments.course_id =
                   courses.course_id
               AND courses.user_id = ?
            WHERE assignments.user_id = ?
            ORDER BY
                assignments.due_date ASC,
                assignments.assignment_id ASC
        `,
        [userId, userId],
        (error, assignments) => {
            if (error) {
                return res.status(500).json({
                    error:
                        'Unable to load assignments.'
                });
            }

            return res.json(assignments);
        }
    );
});

// GET one assignment owned by the logged-in user
router.get('/:id', (req, res) => {
    const assignmentId = Number(
        req.params.id
    );

    const userId =
        req.session.user.user_id;

    if (!isValidId(assignmentId)) {
        return res.status(400).json({
            error:
                'A valid assignment ID is required.'
        });
    }

    db.get(
        `
            SELECT
                assignments.assignment_id,
                assignments.course_id,
                assignments.title,
                assignments.description,
                assignments.due_date,
                assignments.priority,
                assignments.status,
                assignments.created_at,
                courses.course_name
            FROM assignments
            LEFT JOIN courses
                ON assignments.course_id =
                   courses.course_id
               AND courses.user_id = ?
            WHERE assignments.assignment_id = ?
              AND assignments.user_id = ?
        `,
        [
            userId,
            assignmentId,
            userId
        ],
        (error, assignment) => {
            if (error) {
                return res.status(500).json({
                    error:
                        'Unable to load the assignment.'
                });
            }

            if (!assignment) {
                return res.status(404).json({
                    error:
                        'Assignment not found.'
                });
            }

            return res.json(assignment);
        }
    );
});

// POST create an assignment for the logged-in user
router.post('/', (req, res) => {
    const userId =
        req.session.user.user_id;

    const assignment =
        cleanAssignment(req.body);

    const validationError =
        validateAssignment(assignment);

    if (validationError) {
        return res.status(400).json({
            error: validationError
        });
    }

    verifyCourseOwnership(
        assignment.course_id,
        userId,
        (courseError, course) => {
            if (courseError) {
                return res.status(500).json({
                    error:
                        'Unable to verify the selected course.'
                });
            }

            if (!course) {
                return res.status(400).json({
                    error:
                        'Select a valid course from your account.'
                });
            }

            db.run(
                `
                    INSERT INTO assignments (
                        user_id,
                        course_id,
                        title,
                        description,
                        due_date,
                        priority,
                        status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    userId,
                    assignment.course_id,
                    assignment.title,
                    assignment.description,
                    assignment.due_date,
                    assignment.priority,
                    assignment.status
                ],
                function (error) {
                    if (error) {
                        return res.status(500).json({
                            error:
                                'Unable to create the assignment.'
                        });
                    }

                    return res.status(201).json({
                        assignment_id:
                            this.lastID,

                        course_id:
                            assignment.course_id,

                        course_name:
                            course.course_name,

                        title:
                            assignment.title,

                        description:
                            assignment.description,

                        due_date:
                            assignment.due_date,

                        priority:
                            assignment.priority,

                        status:
                            assignment.status
                    });
                }
            );
        }
    );
});

// PUT update an assignment owned by the logged-in user
router.put('/:id', (req, res) => {
    const assignmentId = Number(
        req.params.id
    );

    const userId =
        req.session.user.user_id;

    if (!isValidId(assignmentId)) {
        return res.status(400).json({
            error:
                'A valid assignment ID is required.'
        });
    }

    const assignment =
        cleanAssignment(req.body);

    const validationError =
        validateAssignment(assignment);

    if (validationError) {
        return res.status(400).json({
            error: validationError
        });
    }

    verifyCourseOwnership(
        assignment.course_id,
        userId,
        (courseError, course) => {
            if (courseError) {
                return res.status(500).json({
                    error:
                        'Unable to verify the selected course.'
                });
            }

            if (!course) {
                return res.status(400).json({
                    error:
                        'Select a valid course from your account.'
                });
            }

            db.run(
                `
                    UPDATE assignments
                    SET
                        course_id = ?,
                        title = ?,
                        description = ?,
                        due_date = ?,
                        priority = ?,
                        status = ?
                    WHERE assignment_id = ?
                      AND user_id = ?
                `,
                [
                    assignment.course_id,
                    assignment.title,
                    assignment.description,
                    assignment.due_date,
                    assignment.priority,
                    assignment.status,
                    assignmentId,
                    userId
                ],
                function (error) {
                    if (error) {
                        return res.status(500).json({
                            error:
                                'Unable to update the assignment.'
                        });
                    }

                    if (this.changes === 0) {
                        return res.status(404).json({
                            error:
                                'Assignment not found.'
                        });
                    }

                    return res.json({
                        assignment_id:
                            assignmentId,

                        course_id:
                            assignment.course_id,

                        course_name:
                            course.course_name,

                        title:
                            assignment.title,

                        description:
                            assignment.description,

                        due_date:
                            assignment.due_date,

                        priority:
                            assignment.priority,

                        status:
                            assignment.status
                    });
                }
            );
        }
    );
});

// DELETE an assignment owned by the logged-in user
router.delete('/:id', (req, res) => {
    const assignmentId = Number(
        req.params.id
    );

    const userId =
        req.session.user.user_id;

    if (!isValidId(assignmentId)) {
        return res.status(400).json({
            error:
                'A valid assignment ID is required.'
        });
    }

    db.run(
        `
            DELETE FROM assignments
            WHERE assignment_id = ?
              AND user_id = ?
        `,
        [assignmentId, userId],
        function (error) {
            if (error) {
                return res.status(500).json({
                    error:
                        'Unable to delete the assignment.'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error:
                        'Assignment not found.'
                });
            }

            return res.json({
                message:
                    'Assignment deleted successfully.'
            });
        }
    );
});

function verifyCourseOwnership(
    courseId,
    userId,
    callback
) {
    db.get(
        `
            SELECT
                course_id,
                course_name
            FROM courses
            WHERE course_id = ?
              AND user_id = ?
        `,
        [courseId, userId],
        callback
    );
}

function cleanAssignment(body) {
    const courseId = Number(
        body.course_id
    );

    return {
        course_id: courseId,

        title: cleanText(
            body.title
        ),

        description:
            cleanOptionalText(
                body.description
            ),

        due_date: cleanText(
            body.due_date
        ),

        priority: cleanText(
            body.priority
        ) || 'Medium',

        status: cleanText(
            body.status
        ) || 'Not Started'
    };
}

function validateAssignment(assignment) {
    if (
        !isValidId(
            assignment.course_id
        )
    ) {
        return (
            'A valid course is required.'
        );
    }

    if (!assignment.title) {
        return (
            'Assignment title is required.'
        );
    }

    if (
        assignment.title.length > 150
    ) {
        return (
            'Assignment title must be 150 characters or fewer.'
        );
    }

    if (!assignment.due_date) {
        return (
            'Due date is required.'
        );
    }

    if (
        !isValidDate(
            assignment.due_date
        )
    ) {
        return (
            'Enter a valid due date.'
        );
    }

    const validPriorities = [
        'Low',
        'Medium',
        'High'
    ];

    if (
        !validPriorities.includes(
            assignment.priority
        )
    ) {
        return (
            'Priority must be Low, Medium, or High.'
        );
    }

    const validStatuses = [
        'Not Started',
        'In Progress',
        'Complete'
    ];

    if (
        !validStatuses.includes(
            assignment.status
        )
    ) {
        return (
            'Status must be Not Started, In Progress, or Complete.'
        );
    }

    return null;
}

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

function isValidDate(value) {
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            value
        )
    ) {
        return false;
    }

    const date = new Date(
        `${value}T00:00:00`
    );

    return !Number.isNaN(
        date.getTime()
    );
}

module.exports = router;