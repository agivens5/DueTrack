const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../server');
const db = require('../models/db');

jest.setTimeout(10000);

describe('DueTrack API', () => {
    let courseId;
    let assignmentId;

    test('POST /api/courses creates a course', async () => {
        const uniqueName = `Test Course ${Date.now()}`;

        const response = await request(app)
            .post('/api/courses')
            .send({
                course_name: uniqueName,
                instructor: 'Test Instructor',
                semester: 'Fall 2026'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.course_name).toBe(uniqueName);
        expect(response.body.course_id).toBeDefined();

        courseId = response.body.course_id;
    });

    test('GET /api/courses returns all courses', async () => {
        const response = await request(app)
            .get('/api/courses');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        const createdCourse = response.body.find(
            course => course.course_id === courseId
        );

        expect(createdCourse).toBeDefined();
    });

    test('GET /api/courses/:id returns the created course', async () => {
        const response = await request(app)
            .get(`/api/courses/${courseId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.course_id).toBe(courseId);
    });

    test('PUT /api/courses/:id updates the course', async () => {
        const response = await request(app)
            .put(`/api/courses/${courseId}`)
            .send({
                course_name: 'Updated Test Course',
                instructor: 'Updated Instructor',
                semester: 'Spring 2027'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.course_id).toBe(courseId);
        expect(response.body.course_name).toBe('Updated Test Course');
        expect(response.body.instructor).toBe('Updated Instructor');
        expect(response.body.semester).toBe('Spring 2027');
    });

    test('POST /api/courses returns 400 when course name is missing', async () => {
        const response = await request(app)
            .post('/api/courses')
            .send({
                instructor: 'Test Instructor',
                semester: 'Fall 2026'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Course name is required');
    });

    test('GET /api/courses/:id returns 404 for a missing course', async () => {
        const response = await request(app)
            .get('/api/courses/999999');

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Course not found');
    });

    test('POST /api/assignments creates an assignment', async () => {
        const uniqueTitle = `Test Assignment ${Date.now()}`;

        const response = await request(app)
            .post('/api/assignments')
            .send({
                course_id: courseId,
                title: uniqueTitle,
                description: 'Created during Jest testing',
                due_date: '2026-08-01',
                priority: 'High',
                status: 'Not Started'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(uniqueTitle);
        expect(response.body.course_id).toBe(courseId);
        expect(response.body.assignment_id).toBeDefined();

        assignmentId = response.body.assignment_id;
    });

    test('GET /api/assignments returns all assignments', async () => {
        const response = await request(app)
            .get('/api/assignments');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        const createdAssignment = response.body.find(
            assignment => assignment.assignment_id === assignmentId
        );

        expect(createdAssignment).toBeDefined();
    });

    test('GET /api/assignments/:id returns the created assignment', async () => {
        const response = await request(app)
            .get(`/api/assignments/${assignmentId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.assignment_id).toBe(assignmentId);
        expect(response.body.course_id).toBe(courseId);
    });

    test('PUT /api/assignments/:id updates the assignment', async () => {
        const response = await request(app)
            .put(`/api/assignments/${assignmentId}`)
            .send({
                course_id: courseId,
                title: 'Updated Test Assignment',
                description: 'Updated during Jest testing',
                due_date: '2026-08-05',
                priority: 'Medium',
                status: 'Completed'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe('Updated Test Assignment');
        expect(response.body.priority).toBe('Medium');
        expect(response.body.status).toBe('Completed');
    });

    test('POST /api/assignments returns 400 when title is missing', async () => {
        const response = await request(app)
            .post('/api/assignments')
            .send({
                course_id: courseId,
                description: 'Missing title',
                due_date: '2026-08-10',
                priority: 'High',
                status: 'Not Started'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            'Title and due date are required'
        );
    });

    test('POST /api/assignments returns 400 when due date is missing', async () => {
        const response = await request(app)
            .post('/api/assignments')
            .send({
                course_id: courseId,
                title: 'Assignment Without Due Date',
                description: 'Missing due date',
                priority: 'High',
                status: 'Not Started'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            'Title and due date are required'
        );
    });

    test('GET /api/assignments/:id returns 404 for a missing assignment', async () => {
        const response = await request(app)
            .get('/api/assignments/999999');

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Assignment not found');
    });

    test('PUT /api/assignments/:id returns 404 for a missing assignment', async () => {
        const response = await request(app)
            .put('/api/assignments/999999')
            .send({
                course_id: courseId,
                title: 'Missing Assignment',
                description: 'This assignment does not exist',
                due_date: '2026-08-10',
                priority: 'Low',
                status: 'Not Started'
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Assignment not found');
    });

    test('DELETE /api/assignments/:id returns 404 for a missing assignment', async () => {
        const response = await request(app)
            .delete('/api/assignments/999999');

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Assignment not found');
    });

    test('DELETE /api/assignments/:id deletes the test assignment', async () => {
        const response = await request(app)
            .delete(`/api/assignments/${assignmentId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe(
            'Assignment deleted successfully'
        );
    });

    test('DELETE /api/courses/:id deletes the test course', async () => {
        const response = await request(app)
            .delete(`/api/courses/${courseId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe(
            'Course deleted successfully'
        );
    });

    test('DELETE /api/courses/:id returns 404 for a missing course', async () => {
        const response = await request(app)
            .delete('/api/courses/999999');

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Course not found');
    });

     afterAll(done => {
    db.close(err => {
        if (err) {
            done(err);
            return;
        }

        const testDatabasePath = path.join(
            __dirname,
            '../../database/duetrack.test.db'
        );

        if (fs.existsSync(testDatabasePath)) {
            fs.unlinkSync(testDatabasePath);
        }

        done();
    });
});
});