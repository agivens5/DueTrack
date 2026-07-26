const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const databaseName =
    process.env.NODE_ENV === 'test'
        ? 'duetrack.test.db'
        : 'duetrack.db';

const dbPath = path.join(
    __dirname,
    '../../database',
    databaseName
);

const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log(`Connected to ${databaseName}.`);
    }
});

module.exports = db;