const assignmentForm = document.getElementById('assignment-form');
const assignmentList = document.getElementById('assignment-list');
const assignmentMessage = document.getElementById('assignment-message');
const courseSelect = document.getElementById('assignment-course');
const statusFilter = document.getElementById('status-filter');

let assignments = [];

async function loadCourses() {
    const response = await fetch('/api/courses');
    const courses = await response.json();

    courseSelect.innerHTML = '<option value="">Select a course</option>';

    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.course_id;
        option.textContent = course.course_name;
        courseSelect.appendChild(option);
    });
}

async function loadAssignments() {
    try {
        const response = await fetch('/api/assignments');

        if (!response.ok) {
            throw new Error('Unable to load assignments.');
        }

        assignments = await response.json();
        displayAssignments();
    } catch (error) {
        assignmentList.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

function displayAssignments() {
    const selectedStatus = statusFilter.value;

    const visibleAssignments = assignments
        .filter(assignment =>
            selectedStatus === 'All' || assignment.status === selectedStatus
        )
        .sort((first, second) =>
            new Date(first.due_date) - new Date(second.due_date)
        );

    if (visibleAssignments.length === 0) {
        assignmentList.innerHTML = '<p>No assignments match this filter.</p>';
        return;
    }

    assignmentList.innerHTML = visibleAssignments.map(assignment => `
        <article class="list-card">
            <h3>${escapeHtml(assignment.title)}</h3>
            <p><strong>Description:</strong> ${escapeHtml(assignment.description || 'None')}</p>
            <p><strong>Due:</strong> ${escapeHtml(assignment.due_date)}</p>
            <p><strong>Priority:</strong> ${escapeHtml(assignment.priority || 'None')}</p>
            <p><strong>Status:</strong> ${escapeHtml(assignment.status || 'Not Started')}</p>

            <div class="button-row">
                <button onclick="markComplete(${assignment.assignment_id})">
                    Mark Complete
                </button>

                <button class="danger-button"
                    onclick="deleteAssignment(${assignment.assignment_id})">
                    Delete
                </button>
            </div>
        </article>
    `).join('');
}

assignmentForm.addEventListener('submit', async event => {
    event.preventDefault();

    const assignment = {
        course_id: Number(courseSelect.value),
        title: document.getElementById('assignment-title').value.trim(),
        description: document.getElementById('assignment-description').value.trim(),
        due_date: document.getElementById('assignment-due-date').value,
        priority: document.getElementById('assignment-priority').value,
        status: document.getElementById('assignment-status').value
    };

    try {
        const response = await fetch('/api/assignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assignment)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Unable to add assignment.');
        }

        assignmentMessage.textContent = `${result.title} was added successfully.`;
        assignmentMessage.className = 'success';

        assignmentForm.reset();
        await loadAssignments();
    } catch (error) {
        assignmentMessage.textContent = error.message;
        assignmentMessage.className = 'error';
    }
});

async function markComplete(assignmentId) {
    const assignment = assignments.find(
        item => item.assignment_id === assignmentId
    );

    if (!assignment) {
        return;
    }

    const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...assignment,
            status: 'Complete'
        })
    });

    const result = await response.json();

    if (!response.ok) {
        assignmentMessage.textContent =
            result.error || 'Unable to update assignment.';
        assignmentMessage.className = 'error';
        return;
    }

    assignmentMessage.textContent = `${result.title} was marked complete.`;
    assignmentMessage.className = 'success';

    await loadAssignments();
}

async function deleteAssignment(assignmentId) {
    if (!window.confirm('Delete this assignment?')) {
        return;
    }

    const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
        assignmentMessage.textContent =
            result.error || 'Unable to delete assignment.';
        assignmentMessage.className = 'error';
        return;
    }

    assignmentMessage.textContent = result.message;
    assignmentMessage.className = 'success';

    await loadAssignments();
}

function escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = value ?? '';
    return element.innerHTML;
}

statusFilter.addEventListener('change', displayAssignments);

Promise.all([loadCourses(), loadAssignments()]);