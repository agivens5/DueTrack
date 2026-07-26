const db = require('./db');

function initializeDatabase() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS courses (
                course_id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_name TEXT NOT NULL,
                instructor TEXT,
                semester TEXT
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS assignments (
                assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER,
                title TEXT NOT NULL,
                description TEXT,
                due_date TEXT NOT NULL,
                priority TEXT,
                status TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(course_id) REFERENCES courses(course_id)
            )
        `);
    });
}

module.exports = initializeDatabase;