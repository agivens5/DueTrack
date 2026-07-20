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
The DueTrack application is now fully integrated with the backend and provides a complete end-to-end user experience. All major application features have been implemented, tested, and verified to function correctly. The project is now ready to move into the final documentation, application refinement, and presentation phase.
