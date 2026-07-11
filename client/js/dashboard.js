const API_URL = '/api';

async function loadDashboard() {
    try {
        const [coursesResponse, assignmentsResponse] = await Promise.all([
            fetch(`${API_URL}/courses`),
            fetch(`${API_URL}/assignments`)
        ]);

        if (!coursesResponse.ok || !assignmentsResponse.ok) {
            throw new Error('Unable to load dashboard data.');
        }

        const courses = await coursesResponse.json();
        const assignments = await assignmentsResponse.json();

        const completedAssignments = assignments.filter(
            assignment => assignment.status === 'Complete'
        );

        const incompleteAssignments = assignments.filter(
            assignment => assignment.status !== 'Complete'
        );

        document.getElementById('course-count').textContent = courses.length;
        document.getElementById('assignment-count').textContent = assignments.length;
        document.getElementById('completed-count').textContent =
            completedAssignments.length;
        document.getElementById('incomplete-count').textContent =
            incompleteAssignments.length;

        displayUpcomingAssignments(assignments);
    } catch (error) {
        document.getElementById('upcoming-assignments').innerHTML =
            `<p class="error">${error.message}</p>`;
    }
}

function displayUpcomingAssignments(assignments) {
    const container = document.getElementById('upcoming-assignments');

    const incompleteAssignments = assignments
        .filter(assignment => assignment.status !== 'Complete')
        .sort((first, second) =>
            new Date(first.due_date) - new Date(second.due_date)
        )
        .slice(0, 5);

    if (incompleteAssignments.length === 0) {
        container.innerHTML = '<p>No upcoming assignments.</p>';
        return;
    }

    container.innerHTML = incompleteAssignments.map(assignment => `
        <article class="list-card">
            <h3>${escapeHtml(assignment.title)}</h3>
            <p><strong>Due:</strong> ${escapeHtml(assignment.due_date)}</p>
            <p><strong>Priority:</strong> ${escapeHtml(assignment.priority || 'None')}</p>
            <p><strong>Status:</strong> ${escapeHtml(assignment.status || 'Not Started')}</p>
        </article>
    `).join('');
}

function escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = value ?? '';
    return element.innerHTML;
}

loadDashboard();