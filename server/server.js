const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const initializeDatabase = require('./models/initDb');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const assignmentRoutes = require(
    './routes/assignmentRoutes'
);

const app = express();

const PORT = process.env.PORT || 3000;

initializeDatabase();

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    session({
        name: 'duetrack.sid',

        secret:
            process.env.SESSION_SECRET ||
            'duetrack-development-secret-change-me',

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,

            secure:
                process.env.NODE_ENV ===
                'production',

            sameSite: 'lax',

            maxAge:
                1000 *
                60 *
                60 *
                24 *
                7
        }
    })
);

app.use(
    express.static(
        path.join(__dirname, '../client')
    )
);

app.use('/api/auth', authRoutes);

app.use('/api/courses', courseRoutes);

app.use(
    '/api/assignments',
    assignmentRoutes
);

app.get('/', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            '../client/index.html'
        )
    );
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found.'
    });
});

app.use((error, req, res, next) => {
    console.error(
        'Server error:',
        error
    );

    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({
        error:
            'An unexpected server error occurred.'
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(
            `DueTrack running at http://localhost:${PORT}`
        );
    });
}

module.exports = app;