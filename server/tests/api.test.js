const request = require('supertest');
const app = require('../server');

describe('DueTrack API', () => {
    let createdCourseId;
    let createdAssignmentId;

    test('POST /api/courses creates and returns the correct course data', async () => {
        const courseData = {
            course_name: 'COSC 495',
            instructor: 'Professor Valis',
            semester: 'Summer 2026'
        };

        const response = await request(app)
            .post('/api/courses')
            .send(courseData);

        expect(response.statusCode).toBe(201);
        expect(response.body.course_name).toBe('COSC 495');
        expect(response.body.instructor).toBe('Professor Valis');
        expect(response.body.semester).toBe('Summer 2026');
        expect(response.body.course_id).toBeDefined();

        createdCourseId = response.body.course_id;
    });

    test('GET /api/courses/:id returns the newly created course', async () => {
        const response = await request(app)
            .get(`/api/courses/${createdCourseId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.course_id).toBe(createdCourseId);
        expect(response.body.course_name).toBe('COSC 495');
    });

    test('POST /api/assignments creates an assignment with expected data', async () => {
        const assignmentData = {
            course_id: createdCourseId,
            title: 'Week 7 Demo',
            description: 'Demonstrate the working DueTrack application',
            due_date: '2026-07-13',
            priority: 'High',
            status: 'In Progress'
        };

        const response = await request(app)
            .post('/api/assignments')
            .send(assignmentData);

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('Week 7 Demo');
        expect(response.body.priority).toBe('High');
        expect(response.body.status).toBe('In Progress');
        expect(response.body.course_id).toBe(createdCourseId);
        expect(response.body.assignment_id).toBeDefined();

        createdAssignmentId = response.body.assignment_id;
    });

    test('PUT /api/assignments/:id changes the assignment status', async () => {
        const updatedAssignment = {
            course_id: createdCourseId,
            title: 'Week 7 Demo',
            description: 'Demonstrate the working DueTrack application',
            due_date: '2026-07-13',
            priority: 'High',
            status: 'Complete'
        };

        const response = await request(app)
            .put(`/api/assignments/${createdAssignmentId}`)
            .send(updatedAssignment);

        expect(response.statusCode).toBe(200);
        expect(response.body.assignment_id).toBe(createdAssignmentId);
        expect(response.body.status).toBe('Complete');
    });

    test('GET /api/assignments/:id returns the updated assignment', async () => {
        const response = await request(app)
            .get(`/api/assignments/${createdAssignmentId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe('Week 7 Demo');
        expect(response.body.status).toBe('Complete');
    });

    test('DELETE /api/assignments/:id removes the assignment', async () => {
        const deleteResponse = await request(app)
            .delete(`/api/assignments/${createdAssignmentId}`);

        expect(deleteResponse.statusCode).toBe(200);
        expect(deleteResponse.body.message)
            .toBe('Assignment deleted successfully');

        const getResponse = await request(app)
            .get(`/api/assignments/${createdAssignmentId}`);

        expect(getResponse.statusCode).toBe(404);
        expect(getResponse.body.error).toBe('Assignment not found');
    });

    test('DELETE /api/courses/:id removes the course', async () => {
        const deleteResponse = await request(app)
            .delete(`/api/courses/${createdCourseId}`);

        expect(deleteResponse.statusCode).toBe(200);
        expect(deleteResponse.body.message)
            .toBe('Course deleted successfully');

        const getResponse = await request(app)
            .get(`/api/courses/${createdCourseId}`);

        expect(getResponse.statusCode).toBe(404);
        expect(getResponse.body.error).toBe('Course not found');
    });

    test('POST /api/courses rejects a missing course name', async () => {
        const response = await request(app)
            .post('/api/courses')
            .send({
                instructor: 'Professor Valis',
                semester: 'Summer 2026'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Course name is required');
    });
});