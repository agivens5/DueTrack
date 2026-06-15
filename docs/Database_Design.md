# Database Design

## Courses Table

| Field | Type | Description |
|---------|---------|---------|
| course_id | INTEGER | Primary Key |
| course_name | TEXT | Name of the course |
| instructor | TEXT | Instructor name |
| semester | TEXT | Semester |

## Assignments Table

| Field | Type | Description |
|---------|---------|---------|
| assignment_id | INTEGER | Primary Key |
| title | TEXT | Assignment title |
| description | TEXT | Assignment details |
| due_date | TEXT | Due date |
| priority | TEXT | High, Medium, Low |
| status | TEXT | Complete or Incomplete |
| course_id | INTEGER | Foreign Key |

## Relationship

One Course can have Many Assignments.

## SQL Schema

```sql
CREATE TABLE Courses (
    course_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_name TEXT NOT NULL,
    instructor TEXT,
    semester TEXT
);

CREATE TABLE Assignments (
    assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    priority TEXT,
    status TEXT,
    course_id INTEGER,
    FOREIGN KEY(course_id) REFERENCES Courses(course_id)
);
```