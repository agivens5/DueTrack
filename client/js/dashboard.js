const API_URL = '/api';

let assignmentStatusChart = null;
let dashboardAssignments = [];

async function loadDashboard() {
    const upcomingContainer = document.getElementById(
        'upcoming-assignments'
    );

    const chartSummary = document.getElementById(
        'chart-summary'
    );

    try {
        const [
            coursesResponse,
            assignmentsResponse
        ] = await Promise.all([
            fetch(`${API_URL}/courses`),
            fetch(`${API_URL}/assignments`)
        ]);

        if (
            !coursesResponse.ok ||
            !assignmentsResponse.ok
        ) {
            throw new Error(
                'Unable to load dashboard data.'
            );
        }

        const courses = await coursesResponse.json();
        const assignments =
            await assignmentsResponse.json();

        dashboardAssignments = assignments;

        const completedAssignments = assignments.filter(
            assignment =>
                assignment.status === 'Complete'
        );

        const incompleteAssignments = assignments.filter(
            assignment =>
                assignment.status !== 'Complete'
        );

        const overdueAssignments =
            assignments.filter(isOverdue);

        document.getElementById(
            'course-count'
        ).textContent = courses.length;

        document.getElementById(
            'assignment-count'
        ).textContent = assignments.length;

        document.getElementById(
            'completed-count'
        ).textContent = completedAssignments.length;

        document.getElementById(
            'incomplete-count'
        ).textContent = incompleteAssignments.length;

        document.getElementById(
            'overdue-count'
        ).textContent = overdueAssignments.length;

        displayAssignmentChart(assignments);
        displayUpcomingAssignments(assignments);
    } catch (error) {
        upcomingContainer.innerHTML = `
            <div class="empty-state">
                <p class="error">
                    ${escapeHtml(error.message)}
                </p>
            </div>
        `;

        if (chartSummary) {
            chartSummary.innerHTML = `
                <div class="empty-state">
                    <p class="error">
                        ${escapeHtml(error.message)}
                    </p>
                </div>
            `;
        }
    }
}

function displayAssignmentChart(assignments) {
    const chartCanvas = document.getElementById(
        'assignment-status-chart'
    );

    const chartSummary = document.getElementById(
        'chart-summary'
    );

    if (!chartCanvas || !chartSummary) {
        return;
    }

    if (typeof Chart === 'undefined') {
        chartSummary.innerHTML = `
            <div class="empty-state">
                <span
                    class="empty-state-icon"
                    aria-hidden="true"
                >
                    📊
                </span>

                <h3>Chart unavailable</h3>

                <p>
                    The chart library could not be loaded.
                </p>
            </div>
        `;

        return;
    }

    const statusCounts = getStatusCounts(assignments);

    const totalAssignments =
        statusCounts.complete +
        statusCounts.inProgress +
        statusCounts.notStarted;

    displayChartSummary(
        statusCounts,
        totalAssignments
    );

    if (assignmentStatusChart) {
        assignmentStatusChart.destroy();
    }

    const styles = getComputedStyle(
        document.documentElement
    );

    const textColor = styles
        .getPropertyValue('--text')
        .trim();

    const surfaceColor = styles
        .getPropertyValue('--surface')
        .trim();

    const borderColor = styles
        .getPropertyValue('--card-border')
        .trim();

    const hasAssignments = totalAssignments > 0;

    const labels = hasAssignments
        ? [
            'Complete',
            'In Progress',
            'Not Started'
        ]
        : ['No Assignments'];

    const chartData = hasAssignments
        ? [
            statusCounts.complete,
            statusCounts.inProgress,
            statusCounts.notStarted
        ]
        : [1];

    const chartColors = hasAssignments
        ? [
            '#16803c',
            '#3559e0',
            '#98a2b3'
        ]
        : [borderColor || '#c9ced6'];

    assignmentStatusChart = new Chart(
        chartCanvas,
        {
            type: 'doughnut',

            data: {
                labels,

                datasets: [
                    {
                        data: chartData,
                        backgroundColor: chartColors,
                        borderColor: surfaceColor,
                        borderWidth: 4,
                        hoverOffset: 8
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '67%',

                animation: {
                    duration: 700
                },

                plugins: {
                    legend: {
                        position: 'bottom',

                        labels: {
                            color: textColor,
                            padding: 18,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 13,
                                weight: 'bold'
                            }
                        }
                    },

                    tooltip: {
                        enabled: hasAssignments,

                        callbacks: {
                            label(context) {
                                const value = context.raw;

                                const percentage =
                                    totalAssignments === 0
                                        ? 0
                                        : Math.round(
                                            (
                                                value /
                                                totalAssignments
                                            ) * 100
                                        );

                                return (
                                    `${context.label}: ` +
                                    `${value} (${percentage}%)`
                                );
                            }
                        }
                    }
                }
            }
        }
    );
}

function getStatusCounts(assignments) {
    return assignments.reduce(
        (counts, assignment) => {
            const status =
                assignment.status || 'Not Started';

            if (status === 'Complete') {
                counts.complete += 1;
            } else if (status === 'In Progress') {
                counts.inProgress += 1;
            } else {
                counts.notStarted += 1;
            }

            return counts;
        },
        {
            complete: 0,
            inProgress: 0,
            notStarted: 0
        }
    );
}

function displayChartSummary(
    statusCounts,
    totalAssignments
) {
    const chartSummary = document.getElementById(
        'chart-summary'
    );

    if (!chartSummary) {
        return;
    }

    if (totalAssignments === 0) {
        chartSummary.innerHTML = `
            <div class="empty-state chart-empty-state">
                <span
                    class="empty-state-icon"
                    aria-hidden="true"
                >
                    📊
                </span>

                <h3>No assignment data yet</h3>

                <p>
                    Add an assignment to see your progress
                    chart.
                </p>
            </div>
        `;

        return;
    }

    const completionPercentage = Math.round(
        (
            statusCounts.complete /
            totalAssignments
        ) * 100
    );

    chartSummary.innerHTML = `
        <div class="progress-highlight">
            <p class="progress-label">
                Completion Rate
            </p>

            <p class="progress-percentage">
                ${completionPercentage}%
            </p>

            <p class="progress-description">
                ${statusCounts.complete} of
                ${totalAssignments}
                ${getAssignmentWord(totalAssignments)}
                completed
            </p>
        </div>

        <div class="chart-stat-list">
            <div class="chart-stat-item">
                <span
                    class="chart-stat-dot complete-dot"
                    aria-hidden="true"
                ></span>

                <span>Complete</span>

                <strong>
                    ${statusCounts.complete}
                </strong>
            </div>

            <div class="chart-stat-item">
                <span
                    class="chart-stat-dot progress-dot"
                    aria-hidden="true"
                ></span>

                <span>In Progress</span>

                <strong>
                    ${statusCounts.inProgress}
                </strong>
            </div>

            <div class="chart-stat-item">
                <span
                    class="chart-stat-dot not-started-dot"
                    aria-hidden="true"
                ></span>

                <span>Not Started</span>

                <strong>
                    ${statusCounts.notStarted}
                </strong>
            </div>
        </div>
    `;
}

function getAssignmentWord(totalAssignments) {
    return totalAssignments === 1
        ? 'assignment'
        : 'assignments';
}

function displayUpcomingAssignments(assignments) {
    const container = document.getElementById(
        'upcoming-assignments'
    );

    const today = startOfToday();
    const sevenDaysFromToday = new Date(today);

    sevenDaysFromToday.setDate(
        today.getDate() + 7
    );

    const upcomingAssignments = assignments
        .filter(assignment => {
            if (
                assignment.status === 'Complete' ||
                !assignment.due_date
            ) {
                return false;
            }

            const dueDate = parseDate(
                assignment.due_date
            );

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
                <span
                    class="empty-state-icon"
                    aria-hidden="true"
                >
                    🎉
                </span>

                <h3>No assignments due soon</h3>

                <p>
                    You do not have any incomplete
                    assignments due within the next seven
                    days.
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
                <article
                    class="list-card upcoming-card"
                >
                    <div class="card-title-row">
                        <div>
                            <p class="due-label">
                                ${getDueLabel(
                                    daysUntilDue
                                )}
                            </p>

                            <h3>
                                ${escapeHtml(
                                    assignment.title
                                )}
                            </h3>
                        </div>

                        <span class="
                            priority-badge
                            priority-${getClassName(
                                assignment.priority ||
                                'Medium'
                            )}
                        ">
                            ${escapeHtml(
                                assignment.priority ||
                                'Medium'
                            )}
                        </span>
                    </div>

                    <p class="assignment-date">
                        <strong>Due:</strong>

                        ${formatDate(
                            assignment.due_date
                        )}
                    </p>

                    <span class="
                        status-badge
                        status-${getClassName(
                            assignment.status ||
                            'Not Started'
                        )}
                    ">
                        ${escapeHtml(
                            assignment.status ||
                            'Not Started'
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

    return (
        parseDate(assignment.due_date) <
        startOfToday()
    );
}

function getDaysUntilDue(dateValue) {
    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    return Math.round(
        (
            parseDate(dateValue) -
            startOfToday()
        ) / millisecondsPerDay
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
    return new Date(
        `${dateValue}T00:00:00`
    );
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

    return parseDate(
        dateValue
    ).toLocaleDateString(
        'en-US',
        {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }
    );
}

function getClassName(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
}

function escapeHtml(value) {
    const element =
        document.createElement('div');

    element.textContent = value ?? '';

    return element.innerHTML;
}

window.addEventListener(
    'duetrack-theme-change',
    () => {
        if (dashboardAssignments.length > 0) {
            displayAssignmentChart(
                dashboardAssignments
            );
        } else if (
            document.getElementById(
                'assignment-status-chart'
            )
        ) {
            displayAssignmentChart([]);
        }
    }
);

loadDashboard();