# System Architecture

# Overview

DueTrack follows a three-tier architecture using a web-based frontend, a RESTful backend API, and a SQLite database.

```text
                User
                  │
                  ▼
      Frontend (HTML/CSS/JavaScript)
                  │
                  ▼
        Authentication Layer
     (Login / Sessions / Middleware)
                  │
                  ▼
      Express REST API (Node.js)
                  │
                  ▼
          SQLite Database
```

---

# Frontend

The frontend was developed using HTML5, CSS3, and JavaScript.

It provides users with pages for:

- User Registration
- User Login
- Dashboard
- Course Management
- Assignment Management
- Calendar View

The frontend communicates with the backend using the Fetch API.

---

# Backend

The backend was developed using Node.js and Express.js.

It is responsible for:

- Processing HTTP requests
- Managing authentication
- Handling CRUD operations
- Validating user input
- Returning JSON responses
- Communicating with the SQLite database

---

# Authentication

Authentication is implemented using:

- bcrypt password hashing
- express-session
- Session cookies
- Authentication middleware

Protected API routes require users to be logged in before accessing application data.

---

# Database

SQLite stores all application data including:

- Users
- Courses
- Assignments

Relationships are enforced using foreign keys.

---

# MVC Architecture

## Model

Responsible for interacting with the SQLite database.

Examples:

- Database connection
- Database initialization
- SQL queries

---

## View

Responsible for displaying information to users.

Examples:

- Dashboard
- Login page
- Registration page
- Courses page
- Assignments page

---

## Controller

Responsible for processing requests, validating data, and coordinating communication between the View and Model.

Examples:

- Authentication routes
- Course routes
- Assignment routes
