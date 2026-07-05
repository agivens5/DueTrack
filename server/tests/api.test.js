const request = require('supertest');
const app = require('../server');

describe('DueTrack API', () => {
    test('GET / should return API running message', async () => {
        const response = await request(app).get('/');

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('DueTrack API is running');
    });

    test('GET /api/courses should return an array', async () => {
        const response = await request(app).get('/api/courses');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/assignments should return an array', async () => {
        const response = await request(app).get('/api/assignments');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});