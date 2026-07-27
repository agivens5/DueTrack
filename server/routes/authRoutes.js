const express = require('express');
const bcrypt = require('bcryptjs');

const db = require('../models/db');
const requireAuth = require(
    '../middleware/requireAuth'
);

const router = express.Router();

const MINIMUM_PASSWORD_LENGTH = 8;
const PASSWORD_HASH_ROUNDS = 12;

router.post('/register', async (req, res) => {
    const firstName = cleanText(
        req.body.first_name
    );

    const lastName = cleanText(
        req.body.last_name
    );

    const email = normalizeEmail(
        req.body.email
    );

    const password =
        typeof req.body.password ===
        'string'
            ? req.body.password
            : '';

    const validationError =
        validateRegistration({
            firstName,
            lastName,
            email,
            password
        });

    if (validationError) {
        return res.status(400).json({
            error: validationError
        });
    }

    try {
        const existingUser =
            await getUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                error:
                    'An account with this email already exists.'
            });
        }

        const passwordHash =
            await bcrypt.hash(
                password,
                PASSWORD_HASH_ROUNDS
            );

        const newUser =
            await createUser({
                firstName,
                lastName,
                email,
                passwordHash
            });

        await regenerateSession(req);

        req.session.user = {
            user_id: newUser.user_id,
            first_name:
                newUser.first_name,
            last_name:
                newUser.last_name,
            email: newUser.email,
            created_at:
                newUser.created_at,
            last_login_at:
                newUser.last_login_at
        };

        await saveSession(req);

        return res.status(201).json({
            message:
                'Your DueTrack account was created successfully.',

            user: req.session.user
        });
    } catch (error) {
        console.error(
            'Registration error:',
            error
        );

        if (
            error.code ===
            'SQLITE_CONSTRAINT'
        ) {
            return res.status(409).json({
                error:
                    'An account with this email already exists.'
            });
        }

        return res.status(500).json({
            error:
                'Unable to create your account.'
        });
    }
});

router.post('/login', async (req, res) => {
    const email = normalizeEmail(
        req.body.email
    );

    const password =
        typeof req.body.password ===
        'string'
            ? req.body.password
            : '';

    if (!email || !password) {
        return res.status(400).json({
            error:
                'Email and password are required.'
        });
    }

    try {
        const user =
            await getUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                error:
                    'The email or password is incorrect.'
            });
        }

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (!passwordMatches) {
            return res.status(401).json({
                error:
                    'The email or password is incorrect.'
            });
        }

        const lastLoginAt =
            new Date().toISOString();

        await updateLastLogin(
            user.user_id,
            lastLoginAt
        );

        await regenerateSession(req);

        req.session.user = {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            created_at: user.created_at,
            last_login_at: lastLoginAt
        };

        await saveSession(req);

        return res.json({
            message:
                'You logged in successfully.',

            user: req.session.user
        });
    } catch (error) {
        console.error(
            'Login error:',
            error
        );

        return res.status(500).json({
            error:
                'Unable to log in right now.'
        });
    }
});

router.post('/logout', (req, res) => {
    if (!req.session) {
        return res.json({
            message:
                'You are already logged out.'
        });
    }

    req.session.destroy(error => {
        if (error) {
            console.error(
                'Logout error:',
                error
            );

            return res.status(500).json({
                error:
                    'Unable to log out right now.'
            });
        }

        res.clearCookie('duetrack.sid', {
            httpOnly: true,
            sameSite: 'lax',
            secure:
                process.env.NODE_ENV ===
                'production'
        });

        return res.json({
            message:
                'You logged out successfully.'
        });
    });
});

router.get(
    '/me',
    requireAuth,
    (req, res) => {
        return res.json({
            user: req.session.user
        });
    }
);

function validateRegistration({
    firstName,
    lastName,
    email,
    password
}) {
    if (
        !firstName ||
        !lastName ||
        !email ||
        !password
    ) {
        return (
            'First name, last name, email, ' +
            'and password are required.'
        );
    }

    if (
        firstName.length > 50 ||
        lastName.length > 50
    ) {
        return (
            'First and last names must each ' +
            'be 50 characters or fewer.'
        );
    }

    if (!isValidEmail(email)) {
        return (
            'Enter a valid email address.'
        );
    }

    if (email.length > 254) {
        return (
            'The email address is too long.'
        );
    }

    if (
        password.length <
        MINIMUM_PASSWORD_LENGTH
    ) {
        return (
            `Password must contain at least ` +
            `${MINIMUM_PASSWORD_LENGTH} characters.`
        );
    }

    if (password.length > 128) {
        return (
            'Password must be 128 characters or fewer.'
        );
    }

    if (!/[A-Z]/.test(password)) {
        return (
            'Password must include at least ' +
            'one uppercase letter.'
        );
    }

    if (!/[a-z]/.test(password)) {
        return (
            'Password must include at least ' +
            'one lowercase letter.'
        );
    }

    if (!/[0-9]/.test(password)) {
        return (
            'Password must include at least ' +
            'one number.'
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

function normalizeEmail(value) {
    if (typeof value !== 'string') {
        return '';
    }

    return value
        .trim()
        .toLowerCase();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );
}

function getUserByEmail(email) {
    return new Promise(
        (resolve, reject) => {
            db.get(
                `
                    SELECT
                        user_id,
                        first_name,
                        last_name,
                        email,
                        password_hash,
                        created_at,
                        last_login_at
                    FROM users
                    WHERE email = ?
                `,
                [email],
                (error, user) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(user);
                }
            );
        }
    );
}

function createUser({
    firstName,
    lastName,
    email,
    passwordHash
}) {
    return new Promise(
        (resolve, reject) => {
            db.run(
                `
                    INSERT INTO users (
                        first_name,
                        last_name,
                        email,
                        password_hash
                    )
                    VALUES (?, ?, ?, ?)
                `,
                [
                    firstName,
                    lastName,
                    email,
                    passwordHash
                ],
                function (error) {
                    if (error) {
                        reject(error);
                        return;
                    }

                    const userId =
                        this.lastID;

                    db.get(
                        `
                            SELECT
                                user_id,
                                first_name,
                                last_name,
                                email,
                                created_at,
                                last_login_at
                            FROM users
                            WHERE user_id = ?
                        `,
                        [userId],
                        (
                            selectError,
                            user
                        ) => {
                            if (selectError) {
                                reject(
                                    selectError
                                );

                                return;
                            }

                            resolve(user);
                        }
                    );
                }
            );
        }
    );
}

function updateLastLogin(
    userId,
    lastLoginAt
) {
    return new Promise(
        (resolve, reject) => {
            db.run(
                `
                    UPDATE users
                    SET last_login_at = ?
                    WHERE user_id = ?
                `,
                [
                    lastLoginAt,
                    userId
                ],
                error => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                }
            );
        }
    );
}

function regenerateSession(req) {
    return new Promise(
        (resolve, reject) => {
            req.session.regenerate(
                error => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                }
            );
        }
    );
}

function saveSession(req) {
    return new Promise(
        (resolve, reject) => {
            req.session.save(error => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        }
    );
}

module.exports = router;