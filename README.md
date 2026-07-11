# DueTrack

## Overview

DueTrack is a student assignment tracking system developed as part of my COSC 495 Independent Study at Towson University.

The purpose of the application is to help students organize coursework by managing courses, assignments, deadlines, priorities, and completion status in one centralized application.

---

## Features

- Create, edit, and delete courses
- Create, edit, and delete assignments
- Track assignment due dates
- Set assignment priority levels
- Update assignment completion status
- RESTful API backend
- SQLite database storage
- Automated API testing

---

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js (24 LTS)
- Express.js

### Database
- SQLite

### Testing
- Jest
- Supertest

---

## Installation

Clone the repository:

```bash
git clone https://github.com/agivens5/DueTrack.git
```

Move into the project:

```bash
cd DueTrack/server
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
node server.js
```

Open your browser:

```
http://localhost:3000
```

Run automated tests:

```bash
npm test
```

---

## Project Structure

```text
DueTrack
│
├── client
│   ├── css
│   ├── js
│   ├── index.html
│   ├── courses.html
│   └── assignments.html
│
├── database
│
├── docs
│
└── server
    ├── controllers
    ├── models
    ├── routes
    ├── tests
    ├── package.json
    └── server.js
```

---

## Development Timeline

- ✅ Week 1 – Research and project planning
- ✅ Week 2 – Database and architecture design
- ✅ Week 3 – Backend setup
- ✅ Week 4 – Database integration
- ✅ Week 5 – CRUD API implementation
- ✅ Week 6 – Automated API testing
- 🚧 Week 7 – Frontend development and API integration
- ⏳ Week 8 – Feature enhancements and debugging
- ⏳ Week 9 – Final testing and refinement
- ⏳ Week 10 – Documentation and presentation

---

## Future Improvements

- User authentication
- Assignment search
- Assignment filtering
- Dashboard analytics
- Responsive mobile interface
- Assignment notifications

---

## Author

Armani Givens

B.S. Computer Science

Towson University

COSC 495 Independent Study
