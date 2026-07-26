const API_URL = '/api';

async function loadDashboard() {
    const upcomingContainer = document.getElementById(
        'upcoming-assignments'
    );

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

        const overdueAssignments = assignments.filter(isOverdue);

        document.getElementById('course-count').textContent =
            courses.length;

        document.getElementById('assignment-count').textContent =
            assignments.length;

        document.getElementById('completed-count').textContent =
            completedAssignments.length;

        document.getElementById('incomplete-count').textContent =
            incompleteAssignments.length;

        document.getElementById('overdue-count').textContent =
            overdueAssignments.length;

        displayUpcomingAssignments(assignments);
    } catch (error) {
        upcomingContainer.innerHTML = `
            <div class="empty-state">
                <p class="error">${escapeHtml(error.message)}</p>
            </div>
        `;
    }
}

function displayUpcomingAssignments(assignments) {
    const container = document.getElementById(
        'upcoming-assignments'
    );

    const today = startOfToday();
    const sevenDaysFromToday = new Date(today);

    sevenDaysFromToday.setDate(today.getDate() + 7);

    const upcomingAssignments = assignments
        .filter(assignment => {
            if (
                assignment.status === 'Complete' ||
                !assignment.due_date
            ) {
                return false;
            }

            const dueDate = parseDate(assignment.due_date);

            return (
                dueDate >= today &&
                dueDate <= sevenDaysFromToday
            );
        })
        .sort(
            (first, second) =>
                parseDate(first.due_date) -
                parseDate(second.due_date)
        )
        .slice(0, 5);

    if (upcomingAssignments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon" aria-hidden="true">🎉</span>
                <h3>No assignments due soon</h3>
                <p>
                    You do not have any incomplete assignments due
                    within the next seven days.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML = upcomingAssignments
        .map(assignment => {
            const daysUntilDue = getDaysUntilDue(
                assignment.due_date
            );

            return `
                <article class="list-card upcoming-card">
                    <div class="card-title-row">
                        <div>
                            <p class="due-label">
                                ${getDueLabel(daysUntilDue)}
                            </p>

                            <h3>${escapeHtml(assignment.title)}</h3>
                        </div>

                        <span class="
                            priority-badge
                            priority-${getClassName(
                                assignment.priority || 'Medium'
                            )}
                        ">
                            ${escapeHtml(
                                assignment.priority || 'Medium'
                            )}
                        </span>
                    </div>

                    <p class="assignment-date">
                        <strong>Due:</strong>
                        ${formatDate(assignment.due_date)}
                    </p>

                    <span class="
                        status-badge
                        status-${getClassName(
                            assignment.status || 'Not Started'
                        )}
                    ">
                        ${escapeHtml(
                            assignment.status || 'Not Started'
                        )}
                    </span>
                </article>
            `;
        })
        .join('');
}

function isOverdue(assignment) {
    if (
        assignment.status === 'Complete' ||
        !assignment.due_date
    ) {
        return false;
    }

    return parseDate(assignment.due_date) < startOfToday();
}

function getDaysUntilDue(dateValue) {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    return Math.round(
        (parseDate(dateValue) - startOfToday()) /
        millisecondsPerDay
    );
}

function getDueLabel(daysUntilDue) {
    if (daysUntilDue === 0) {
        return 'Due today';
    }

    if (daysUntilDue === 1) {
        return 'Due tomorrow';
    }

    return `Due in ${daysUntilDue} days`;
}

function parseDate(dateValue) {
    return new Date(`${dateValue}T00:00:00`);
}

function startOfToday() {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return today;
}

function formatDate(dateValue) {
    if (!dateValue) {
        return 'No due date';
    }

    return parseDate(dateValue).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

function getClassName(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
}

function escapeHtml(value) {
    const element = document.createElement('div');

    element.textContent = value ?? '';

    return element.innerHTML;
}

loadDashboard();