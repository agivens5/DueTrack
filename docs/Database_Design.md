# Database Design

# Overview

DueTrack uses a relational SQLite database consisting of three primary tables:

- Users
- Courses
- Assignments

Each authenticated user owns their own courses and assignments.

---

# Users Table

| Field | Type | Description |
|---------|---------|-------------|
| user_id | INTEGER | Primary Key |
| first_name | TEXT | User's first name |
| last_name | TEXT | User's last name |
| email | TEXT | Unique email address |
| password | TEXT | Hashed password |
| created_at | TEXT | Account creation timestamp |
| last_login_at | TEXT | Last successful login |

---

# Courses Table

| Field | Type | Description |
|---------|---------|-------------|
| course_id | INTEGER | Primary Key |
| course_name | TEXT | Course name |
| instructor | TEXT | Instructor |
| semester | TEXT | Semester |
| user_id | INTEGER | Foreign Key to Users |

---

# Assignments Table

| Field | Type | Description |
|---------|---------|-------------|
| assignment_id | INTEGER | Primary Key |
| title | TEXT | Assignment title |
| description | TEXT | Assignment description |
| due_date | TEXT | Due date |
| priority | TEXT | High, Medium, or Low |
| status | TEXT | Not Started, In Progress, or Complete |
| course_id | INTEGER | Foreign Key to Courses |
| user_id | INTEGER | Foreign Key to Users |
| created_at | TEXT | Timestamp when assignment was created |

---

# Relationships

One User → Many Courses

One User → Many Assignments

One Course → Many Assignments

---

# Entity Relationship Diagram

```text
Users
------
user_id (PK)
first_name
last_name
email
password

        │
        │ 1
        │
        ▼
Courses
-------
course_id (PK)
course_name
instructor
semester
user_id (FK)

        │
        │ 1
        │
        ▼
Assignments
-----------
assignment_id (PK)
title
description
due_date
priority
status
course_id (FK)
user_id (FK)
created_at
```
