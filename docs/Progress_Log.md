# COSC 495 Progress Log

## Week 1

- Reviewed and analyzed the approved independent study proposal.
- Selected DueTrack (Student Assignment Tracking System) as the project application.
- Researched software architecture concepts including Model-View-Controller (MVC).
- Researched RESTful API design principles and HTTP request methods.
- Researched relational database design and normalization concepts.
- Investigated algorithms commonly used in assignment management systems, including sorting, filtering, and searching.
- Evaluated potential technology stacks for the project.
- Selected HTML, CSS, and JavaScript for the frontend.
- Selected Node.js and Express for the backend.
- Selected SQLite as the database solution.
- Created the GitHub repository and initial project folder structure.
- Created initial project documentation including research notes, project scope, and user stories.

## Week 2

- Designed the relational database schema.
- Defined the relationship between Courses and Assignments.
- Created database design documentation.
- Created the software architecture diagram.
- Planned the MVC project structure.
- Created wireframes for the Dashboard, Courses, and Assignments pages.
- Planned REST API endpoints for the backend.

## Week 3

### Completed

- Initialized the Node.js project.
- Installed Express, SQLite, and CORS.
- Created the backend folder structure (routes, models, and controllers).
- Created the Express server.
- Implemented the initial API routing structure.
- Created the SQLite database connection.
- Created the database initialization script.
- Built the Courses table.
- Built the Assignments table.
- Verified the Express server was running locally.

## Week 4

### Completed

- Connected the Express server to the SQLite database.
- Implemented the initial GET and POST API endpoints.
- Tested API endpoints locally.
- Verified successful communication between the server and database.
- Updated project documentation.
- Published backend progress to GitHub.

## Week 5

### Completed

- Expanded the backend API by implementing the remaining CRUD operations.
- Added GET by ID endpoints for Courses and Assignments.
- Added PUT endpoints for Courses and Assignments.
- Added DELETE endpoints for Courses and Assignments.
- Added basic input validation.
- Added error handling for invalid requests and missing records.
- Tested CRUD endpoints locally.
- Published Week 5 backend updates to GitHub.

## Week 6

### Completed

- Began implementing unit/API testing based on professor feedback.
- Installed Jest and Supertest for backend testing.
- Added a test script to the Node.js project.
- Modified the Express application to support automated testing.
- Created the initial API test suite.
- Verified the root endpoint using automated tests.
- Verified the Courses API endpoint using automated tests.
- Verified the Assignments API endpoint using automated tests.
- Successfully passed all initial automated tests.

### Next Steps

- Expand automated tests for POST, PUT, and DELETE endpoints.
- Continue improving backend reliability and error handling.
- Begin frontend development and integrate it with the backend API.

## Week 7 – API Testing & Quality Assurance

**Focus:** Backend Testing and Quality Assurance

### Goals
- Implement automated testing for the DueTrack backend.
- Verify that all Course and Assignment API endpoints function correctly.
- Improve application reliability by separating the testing environment from the production database.

### Completed Tasks

#### Automated API Testing
- Installed and configured **Jest** and **Supertest** for automated backend testing.
- Developed a comprehensive API test suite for the DueTrack application.
- Verified CRUD functionality for both Courses and Assignments.

#### Course API Tests
Implemented tests for:
- Creating a course (POST)
- Retrieving all courses (GET)
- Retrieving a course by ID (GET)
- Updating a course (PUT)
- Deleting a course (DELETE)
- Returning a 400 Bad Request when the course name is missing
- Returning a 404 Not Found when a course does not exist

#### Assignment API Tests
Implemented tests for:
- Creating an assignment (POST)
- Retrieving all assignments (GET)
- Retrieving an assignment by ID (GET)
- Updating an assignment (PUT)
- Deleting an assignment (DELETE)
- Returning a 400 Bad Request when the assignment title is missing
- Returning a 400 Bad Request when the due date is missing
- Returning a 404 Not Found when an assignment does not exist

#### Test Environment Improvements
- Modified the database configuration to automatically switch between the production database and a dedicated test database using `NODE_ENV`.
- Created a separate SQLite database (`duetrack.test.db`) for automated testing.
- Updated the database initialization process to automatically create tables for both production and test environments.
- Configured the automated test suite to remove the temporary test database after all tests complete, ensuring a clean testing environment.

### Results
- Successfully created **18 automated API tests**.
- All tests pass successfully.
- Verified backend CRUD functionality for Courses and Assignments.
- Verified API validation and error handling for invalid requests and missing resources.
- Improved the reliability and maintainability of the DueTrack backend.

### Technologies Used
- Node.js
- Express.js
- SQLite
- Jest
- Supertest

## Week 8 – Frontend Integration, Testing, and User Interface Improvements

### Completed This Week
- Integrated the frontend with the Express.js backend API.
- Connected the Courses and Assignments pages to the SQLite database using RESTful API endpoints.
- Implemented full CRUD functionality for courses (Create, Read, Update, Delete).
- Implemented full CRUD functionality for assignments, including updating assignment details and deleting assignments.
- Added the ability to mark assignments as complete.
- Added assignment filtering by completion status.
- Implemented edit functionality for both courses and assignments.
- Added confirmation dialogs before deleting records.
- Improved user feedback by displaying success and error messages after operations.
- Updated the interface so changes are reflected immediately without requiring a manual page refresh.
- Improved overall usability by resetting forms after successful submissions and updating button labels during edit operations.

### Testing and Debugging
- Performed extensive manual testing of all frontend features.
- Verified successful communication between the frontend and backend.
- Confirmed Create, Read, Update, and Delete operations function correctly for both courses and assignments.
- Verified assignment completion and filtering functionality.
- Fixed issues discovered during frontend integration and confirmed application stability.

### Technologies Used
- HTML5
- CSS3
- JavaScript (ES6)
- Node.js
- Express.js
- SQLite
- REST API

### Outcome
The DueTrack application now provides a complete end-to-end assignment management system with full CRUD functionality for Courses and Assignments. The frontend and backend are fully integrated, and all core application features have been implemented and tested successfully. The next phase of development will focus on adding secure user authentication, session management, and user-specific data access.

## Week 9 – User Authentication & Application Security

### Focus
Implement secure user authentication and session management to ensure that each user can securely access only their own DueTrack data.

### Goals
- Implement user registration and login.
- Secure user passwords using bcrypt hashing.
- Add session-based authentication.
- Protect backend API routes.
- Restrict users to viewing and modifying only their own courses and assignments.
- Integrate authentication into the frontend.

### Completed Tasks

#### User Authentication
- Created a Users database table to store account information.
- Implemented user registration functionality.
- Implemented secure user login functionality.
- Hashed user passwords using bcrypt before storing them in the database.
- Implemented Express session management for authenticated users.
- Added logout functionality that properly destroys user sessions.

#### Backend Security
- Created authentication middleware to protect API endpoints.
- Updated Courses API routes to require authentication.
- Updated Assignments API routes to require authentication.
- Restricted database queries so users can only access their own courses and assignments.
- Added session validation for protected requests.

#### Frontend Integration
- Created dedicated Login and Registration pages.
- Developed reusable frontend authentication utilities.
- Protected the Dashboard, Courses, and Assignments pages from unauthorized access.
- Added automatic redirection to the login page when a user is not authenticated.
- Displayed the logged-in user's name throughout the application.
- Integrated logout functionality into the navigation bar.

#### Testing and Verification
- Verified user registration.
- Verified user login and logout.
- Verified session persistence during authenticated use.
- Verified protected routes reject unauthorized users.
- Verified each user can only view and manage their own data.
- Tested all CRUD functionality after authentication was integrated.
- Successfully committed and pushed all authentication updates to GitHub.

### Technologies Used
- Node.js
- Express.js
- SQLite
- Express Session
- bcrypt
- HTML5
- CSS3
- JavaScript (ES6)

### Outcome

DueTrack now provides secure user authentication and session management while maintaining all existing assignment management functionality. Users can create accounts, securely log in, manage only their own courses and assignments, and safely log out of the application. The project is now functionally complete and ready for final documentation, deployment, and presentation during Week 10.
