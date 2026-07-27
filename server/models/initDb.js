const db = require('./db');

function initializeDatabase() {
    db.serialize(() => {
        db.run(`
            PRAGMA foreign_keys = ON
        `);

        db.run(
            `
                CREATE TABLE IF NOT EXISTS users (
                    user_id INTEGER
                        PRIMARY KEY
                        AUTOINCREMENT,

                    first_name TEXT NOT NULL,

                    last_name TEXT NOT NULL,

                    email TEXT NOT NULL UNIQUE,

                    password_hash TEXT NOT NULL,

                    created_at TEXT
                        DEFAULT CURRENT_TIMESTAMP,

                    last_login_at TEXT
                )
            `,
            error => {
                if (error) {
                    console.error(
                        'Unable to create users table:',
                        error.message
                    );
                }
            }
        );

        db.run(
            `
                CREATE TABLE IF NOT EXISTS courses (
                    course_id INTEGER
                        PRIMARY KEY
                        AUTOINCREMENT,

                    user_id INTEGER,

                    course_name TEXT NOT NULL,

                    instructor TEXT,

                    semester TEXT,

                    FOREIGN KEY(user_id)
                        REFERENCES users(user_id)
                        ON DELETE CASCADE
                )
            `,
            error => {
                if (error) {
                    console.error(
                        'Unable to create courses table:',
                        error.message
                    );

                    return;
                }

                ensureColumnExists(
                    'courses',
                    'user_id',
                    'INTEGER',
                    migrateExistingCourses
                );
            }
        );

        db.run(
            `
                CREATE TABLE IF NOT EXISTS assignments (
                    assignment_id INTEGER
                        PRIMARY KEY
                        AUTOINCREMENT,

                    user_id INTEGER,

                    course_id INTEGER,

                    title TEXT NOT NULL,

                    description TEXT,

                    due_date TEXT NOT NULL,

                    priority TEXT,

                    status TEXT,

                    created_at TEXT
                        DEFAULT CURRENT_TIMESTAMP,

                    FOREIGN KEY(user_id)
                        REFERENCES users(user_id)
                        ON DELETE CASCADE,

                    FOREIGN KEY(course_id)
                        REFERENCES courses(course_id)
                        ON DELETE CASCADE
                )
            `,
            error => {
                if (error) {
                    console.error(
                        'Unable to create assignments table:',
                        error.message
                    );

                    return;
                }

                ensureColumnExists(
                    'assignments',
                    'user_id',
                    'INTEGER',
                    migrateExistingAssignments
                );
            }
        );
    });
}

function ensureColumnExists(
    tableName,
    columnName,
    columnDefinition,
    callback
) {
    db.all(
        `PRAGMA table_info(${tableName})`,
        [],
        (error, columns) => {
            if (error) {
                console.error(
                    `Unable to inspect ${tableName}:`,
                    error.message
                );

                return;
            }

            const columnExists = columns.some(
                column =>
                    column.name === columnName
            );

            if (columnExists) {
                callback();
                return;
            }

            db.run(
                `
                    ALTER TABLE ${tableName}
                    ADD COLUMN ${columnName}
                    ${columnDefinition}
                `,
                alterError => {
                    if (alterError) {
                        console.error(
                            `Unable to add ${columnName} to ${tableName}:`,
                            alterError.message
                        );

                        return;
                    }

                    console.log(
                        `Added ${columnName} to ${tableName}.`
                    );

                    callback();
                }
            );
        }
    );
}

function migrateExistingCourses() {
    getFirstUserId((error, userId) => {
        if (error) {
            console.error(
                'Unable to migrate existing courses:',
                error.message
            );

            return;
        }

        if (!userId) {
            return;
        }

        db.run(
            `
                UPDATE courses
                SET user_id = ?
                WHERE user_id IS NULL
            `,
            [userId],
            function (updateError) {
                if (updateError) {
                    console.error(
                        'Unable to assign existing courses:',
                        updateError.message
                    );

                    return;
                }

                if (this.changes > 0) {
                    console.log(
                        `${this.changes} existing course(s) assigned to user ${userId}.`
                    );
                }
            }
        );
    });
}

function migrateExistingAssignments() {
    getFirstUserId((error, userId) => {
        if (error) {
            console.error(
                'Unable to migrate existing assignments:',
                error.message
            );

            return;
        }

        if (!userId) {
            return;
        }

        db.run(
            `
                UPDATE assignments
                SET user_id = ?
                WHERE user_id IS NULL
            `,
            [userId],
            function (updateError) {
                if (updateError) {
                    console.error(
                        'Unable to assign existing assignments:',
                        updateError.message
                    );

                    return;
                }

                if (this.changes > 0) {
                    console.log(
                        `${this.changes} existing assignment(s) assigned to user ${userId}.`
                    );
                }
            }
        );
    });
}

function getFirstUserId(callback) {
    db.get(
        `
            SELECT user_id
            FROM users
            ORDER BY user_id ASC
            LIMIT 1
        `,
        [],
        (error, user) => {
            if (error) {
                callback(error);
                return;
            }

            callback(
                null,
                user ? user.user_id : null
            );
        }
    );
}

module.exports = initializeDatabase;