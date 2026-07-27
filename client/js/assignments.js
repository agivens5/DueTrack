'use strict';

const assignmentForm = document.getElementById(
    'assignment-form'
);

const assignmentList = document.getElementById(
    'assignment-list'
);

const assignmentMessage = document.getElementById(
    'assignment-message'
);

const courseSelect = document.getElementById(
    'assignment-course'
);

const statusFilter = document.getElementById(
    'status-filter'
);

const assignmentSearch = document.getElementById(
    'assignment-search'
);

const assignmentSort = document.getElementById(
    'assignment-sort'
);

const clearFiltersButton = document.getElementById(
    'clear-filters-button'
);

const cancelEditButton = document.getElementById(
    'cancel-edit-button'
);

const assignmentFormHeading = document.getElementById(
    'assignment-form-heading'
);

const visibleAssignmentCount = document.getElementById(
    'visible-assignment-count'
);

const listViewButton = document.getElementById(
    'list-view-button'
);

const calendarViewButton = document.getElementById(
    'calendar-view-button'
);

const assignmentListView = document.getElementById(
    'assignment-list-view'
);

const assignmentCalendarView = document.getElementById(
    'assignment-calendar-view'
);

const assignmentCalendarElement = document.getElementById(
    'assignment-calendar'
);

const calendarError = document.getElementById(
    'calendar-error'
);

let assignments = [];
let editingAssignmentId = null;
let assignmentCalendar = null;

async function loadCourses() {
    try {
        const response = await authenticatedFetch('/api/courses');

        if (!response.ok) {
            throw new Error(
                'Unable to load courses.'
            );
        }

        const courses = await response.json();

        courseSelect.innerHTML = `
            <option value="">
                Select a course
            </option>
        `;

        courses.forEach(course => {
            const option =
                document.createElement('option');

            option.value = course.course_id;
            option.textContent = course.course_name;

            courseSelect.appendChild(option);
        });
    } catch (error) {
        showAssignmentMessage(
            error.message,
            'error'
        );
    }
}

async function loadAssignments() {
    try {
        const response = await authenticatedFetch(
            '/api/assignments'
        );

        if (!response.ok) {
            throw new Error(
                'Unable to load assignments.'
            );
        }

        assignments = await response.json();

        displayAssignments();
        renderAssignmentCalendar();
    } catch (error) {
        assignmentList.innerHTML = `
            <div class="empty-state">
                <p class="error">
                    ${escapeHtml(error.message)}
                </p>
            </div>
        `;

        displayCalendarError(error.message);
    }
}

function displayAssignments() {
    const selectedStatus = statusFilter.value;

    const searchText = assignmentSearch.value
        .trim()
        .toLowerCase();

    const visibleAssignments = assignments.filter(
        assignment => {
            const matchesStatus =
                selectedStatus === 'All' ||
                (
                    selectedStatus === 'Overdue' &&
                    isOverdue(assignment)
                ) ||
                assignment.status === selectedStatus;

            const searchableText = [
                assignment.title,
                assignment.description,
                assignment.priority,
                assignment.status,
                assignment.due_date
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const matchesSearch =
                searchableText.includes(searchText);

            return (
                matchesStatus &&
                matchesSearch
            );
        }
    );

    sortAssignments(visibleAssignments);

    updateVisibleAssignmentCount(
        visibleAssignments.length
    );

    if (visibleAssignments.length === 0) {
        assignmentList.innerHTML = `
            <div class="empty-state">
                <span
                    class="empty-state-icon"
                    aria-hidden="true"
                >
                    🔎
                </span>

                <h3>No assignments found</h3>

                <p>
                    Try changing your search, status
                    filter, or sorting option.
                </p>
            </div>
        `;

        return;
    }

    assignmentList.innerHTML = visibleAssignments
        .map(createAssignmentCard)
        .join('');
}

function createAssignmentCard(assignment) {
    const priority =
        assignment.priority || 'Medium';

    const status =
        assignment.status || 'Not Started';

    const overdue = isOverdue(assignment);

    return `
        <article class="
            list-card
            assignment-card
            ${status === 'Complete'
                ? 'completed-assignment'
                : ''}
            ${overdue
                ? 'overdue-assignment'
                : ''}
        ">
            <div class="card-title-row">
                <div>
                    <div class="badge-row">
                        <span class="
                            priority-badge
                            priority-${getClassName(
                                priority
                            )}
                        ">
                            ${escapeHtml(priority)}
                            Priority
                        </span>

                        <span class="
                            status-badge
                            status-${getClassName(
                                status
                            )}
                        ">
                            ${escapeHtml(status)}
                        </span>

                        ${overdue
                            ? `
                                <span class="overdue-badge">
                                    Overdue
                                </span>
                            `
                            : ''}
                    </div>

                    <h3>
                        ${escapeHtml(
                            assignment.title
                        )}
                    </h3>
                </div>

                <p class="assignment-date">
                    <span aria-hidden="true">
                        📅
                    </span>

                    ${formatDate(
                        assignment.due_date
                    )}
                </p>
            </div>

            <div class="assignment-details">
                <p>
                    <strong>Description</strong>
                </p>

                <p>
                    ${escapeHtml(
                        assignment.description ||
                        'No description was provided.'
                    )}
                </p>
            </div>

            <div class="
                button-row
                assignment-button-row
            ">
                <button
                    type="button"
                    class="edit-button"
                    onclick="editAssignment(
                        ${assignment.assignment_id}
                    )"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="complete-button"
                    onclick="markComplete(
                        ${assignment.assignment_id}
                    )"
                    ${status === 'Complete'
                        ? 'disabled'
                        : ''}
                >
                    ${status === 'Complete'
                        ? 'Completed'
                        : 'Mark Complete'}
                </button>

                <button
                    type="button"
                    class="danger-button"
                    onclick="deleteAssignment(
                        ${assignment.assignment_id}
                    )"
                >
                    Delete
                </button>
            </div>
        </article>
    `;
}

function sortAssignments(assignmentArray) {
    const selectedSort = assignmentSort.value;

    const priorityOrder = {
        High: 3,
        Medium: 2,
        Low: 1
    };

    const statusOrder = {
        'Not Started': 1,
        'In Progress': 2,
        Complete: 3
    };

    assignmentArray.sort((first, second) => {
        switch (selectedSort) {
            case 'due-descending':
                return (
                    parseDate(second.due_date) -
                    parseDate(first.due_date)
                );

            case 'priority-high':
                return (
                    (
                        priorityOrder[
                            second.priority
                        ] || 0
                    ) -
                    (
                        priorityOrder[
                            first.priority
                        ] || 0
                    )
                );

            case 'priority-low':
                return (
                    (
                        priorityOrder[
                            first.priority
                        ] || 0
                    ) -
                    (
                        priorityOrder[
                            second.priority
                        ] || 0
                    )
                );

            case 'status':
                return (
                    (
                        statusOrder[
                            first.status
                        ] || 0
                    ) -
                    (
                        statusOrder[
                            second.status
                        ] || 0
                    )
                );

            case 'title':
                return String(
                    first.title || ''
                ).localeCompare(
                    String(
                        second.title || ''
                    )
                );

            case 'due-ascending':
            default:
                return (
                    parseDate(first.due_date) -
                    parseDate(second.due_date)
                );
        }
    });
}

function renderAssignmentCalendar() {
    if (
        !assignmentCalendarElement ||
        typeof FullCalendar === 'undefined'
    ) {
        displayCalendarError(
            'The calendar library could not be loaded.'
        );

        return;
    }

    hideCalendarError();

    const events = assignments
        .filter(
            assignment => assignment.due_date
        )
        .map(createCalendarEvent);

    if (!assignmentCalendar) {
        assignmentCalendar =
            new FullCalendar.Calendar(
                assignmentCalendarElement,
                {
                    initialView: 'dayGridMonth',

                    headerToolbar: {
                        left: 'prev,next today',
                        center: 'title',
                        right: ''
                    },

                    buttonText: {
                        today: 'Today'
                    },

                    height: 'auto',
                    fixedWeekCount: false,
                    showNonCurrentDates: true,
                    dayMaxEvents: 3,

                    events,

                    dateClick(info) {
                        beginAssignmentForDate(
                            info.dateStr
                        );
                    },

                    eventClick(info) {
                        const assignmentId = Number(
                            info.event.extendedProps
                                .assignmentId
                        );

                        editAssignment(
                            assignmentId
                        );
                    },

                    eventDidMount(info) {
                        const assignment =
                            assignments.find(
                                item =>
                                    item.assignment_id ===
                                    Number(
                                        info.event
                                            .extendedProps
                                            .assignmentId
                                    )
                            );

                        if (!assignment) {
                            return;
                        }

                        info.el.title =
                            createCalendarTooltip(
                                assignment
                            );
                    }
                }
            );

        assignmentCalendar.render();
    } else {
        assignmentCalendar.removeAllEvents();

        events.forEach(event => {
            assignmentCalendar.addEvent(event);
        });
    }
}

function createCalendarEvent(assignment) {
    const colors =
        getCalendarEventColors(assignment);

    return {
        id: String(
            assignment.assignment_id
        ),

        title: assignment.title,

        start: assignment.due_date,

        allDay: true,

        backgroundColor:
            colors.backgroundColor,

        borderColor:
            colors.borderColor,

        textColor:
            colors.textColor,

        extendedProps: {
            assignmentId:
                assignment.assignment_id,

            status:
                assignment.status ||
                'Not Started',

            priority:
                assignment.priority ||
                'Medium',

            description:
                assignment.description || ''
        }
    };
}

function getCalendarEventColors(assignment) {
    const darkMode =
        document.documentElement.dataset.theme ===
        'dark';

    if (isOverdue(assignment)) {
        return {
            backgroundColor: darkMode
                ? '#7f2929'
                : '#c73737',

            borderColor: darkMode
                ? '#ff9189'
                : '#a92e2e',

            textColor: '#ffffff'
        };
    }

    switch (
        assignment.status || 'Not Started'
    ) {
        case 'Complete':
            return {
                backgroundColor: darkMode
                    ? '#24593a'
                    : '#16803c',

                borderColor: darkMode
                    ? '#75d99b'
                    : '#126b32',

                textColor: '#ffffff'
            };

        case 'In Progress':
            return {
                backgroundColor: darkMode
                    ? '#2e478f'
                    : '#3559e0',

                borderColor: darkMode
                    ? '#9fc0ff'
                    : '#2747c7',

                textColor: '#ffffff'
            };

        case 'Not Started':
        default:
            return {
                backgroundColor: darkMode
                    ? '#4a5260'
                    : '#667085',

                borderColor: darkMode
                    ? '#d0d5dd'
                    : '#475467',

                textColor: '#ffffff'
            };
    }
}

function createCalendarTooltip(assignment) {
    const parts = [
        assignment.title,
        `Due: ${formatDate(
            assignment.due_date
        )}`,
        `Status: ${
            assignment.status ||
            'Not Started'
        }`,
        `Priority: ${
            assignment.priority ||
            'Medium'
        }`
    ];

    if (assignment.description) {
        parts.push(
            `Description: ${
                assignment.description
            }`
        );
    }

    return parts.join('\n');
}

function beginAssignmentForDate(dateValue) {
    resetAssignmentForm();

    document.getElementById(
        'assignment-due-date'
    ).value = dateValue;

    showAssignmentMessage(
        `Due date selected: ${
            formatDate(dateValue)
        }. Complete the form to add an assignment.`,
        ''
    );

    assignmentForm.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    document.getElementById(
        'assignment-title'
    ).focus();
}

function switchAssignmentView(viewName) {
    const showingCalendar =
        viewName === 'calendar';

    assignmentListView.classList.toggle(
        'hidden',
        showingCalendar
    );

    assignmentCalendarView.classList.toggle(
        'hidden',
        !showingCalendar
    );

    listViewButton.classList.toggle(
        'active',
        !showingCalendar
    );

    calendarViewButton.classList.toggle(
        'active',
        showingCalendar
    );

    listViewButton.setAttribute(
        'aria-pressed',
        String(!showingCalendar)
    );

    calendarViewButton.setAttribute(
        'aria-pressed',
        String(showingCalendar)
    );

    localStorage.setItem(
        'duetrack-assignment-view',
        showingCalendar
            ? 'calendar'
            : 'list'
    );

    if (
        showingCalendar &&
        assignmentCalendar
    ) {
        window.setTimeout(() => {
            assignmentCalendar.updateSize();
        }, 0);
    }
}

function displayCalendarError(message) {
    if (!calendarError) {
        return;
    }

    calendarError.classList.remove('hidden');

    calendarError.innerHTML = `
        <div class="empty-state">
            <span
                class="empty-state-icon"
                aria-hidden="true"
            >
                📅
            </span>

            <h3>Calendar unavailable</h3>

            <p class="error">
                ${escapeHtml(message)}
            </p>
        </div>
    `;
}

function hideCalendarError() {
    if (!calendarError) {
        return;
    }

    calendarError.classList.add('hidden');
    calendarError.innerHTML = '';
}

assignmentForm.addEventListener(
    'submit',
    async event => {
        event.preventDefault();

        const assignment = {
            course_id: Number(
                courseSelect.value
            ),

            title: document
                .getElementById(
                    'assignment-title'
                )
                .value
                .trim(),

            description: document
                .getElementById(
                    'assignment-description'
                )
                .value
                .trim(),

            due_date: document
                .getElementById(
                    'assignment-due-date'
                )
                .value,

            priority: document
                .getElementById(
                    'assignment-priority'
                )
                .value,

            status: document
                .getElementById(
                    'assignment-status'
                )
                .value
        };

        const isEditing =
            editingAssignmentId !== null;

        const url = isEditing
            ? `/api/assignments/${
                editingAssignmentId
            }`
            : '/api/assignments';

        const method = isEditing
            ? 'PUT'
            : 'POST';

        try {
            const response = await authenticatedFetch(
                url,
                {
                    method,

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify(
                        assignment
                    )
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    `Unable to ${
                        isEditing
                            ? 'update'
                            : 'add'
                    } assignment.`
                );
            }

            showAssignmentMessage(
                isEditing
                    ? `${result.title} was updated successfully.`
                    : `${result.title} was added successfully.`,
                'success'
            );

            resetAssignmentForm();

            await loadAssignments();
        } catch (error) {
            showAssignmentMessage(
                error.message,
                'error'
            );
        }
    }
);

function editAssignment(assignmentId) {
    const assignment = assignments.find(
        item =>
            item.assignment_id ===
            assignmentId
    );

    if (!assignment) {
        showAssignmentMessage(
            'Assignment could not be found.',
            'error'
        );

        return;
    }

    editingAssignmentId = assignmentId;

    courseSelect.value =
        assignment.course_id ?? '';

    document.getElementById(
        'assignment-title'
    ).value = assignment.title || '';

    document.getElementById(
        'assignment-description'
    ).value =
        assignment.description || '';

    document.getElementById(
        'assignment-due-date'
    ).value =
        assignment.due_date || '';

    document.getElementById(
        'assignment-priority'
    ).value =
        assignment.priority || 'Medium';

    document.getElementById(
        'assignment-status'
    ).value =
        assignment.status ||
        'Not Started';

    assignmentFormHeading.textContent =
        'Edit Assignment';

    document.getElementById(
        'assignment-submit-button'
    ).textContent = 'Update Assignment';

    cancelEditButton.classList.remove(
        'hidden'
    );

    showAssignmentMessage(
        'Edit the information, then click Update Assignment.',
        ''
    );

    assignmentForm.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

async function markComplete(assignmentId) {
    const assignment = assignments.find(
        item =>
            item.assignment_id ===
            assignmentId
    );

    if (!assignment) {
        showAssignmentMessage(
            'Assignment could not be found.',
            'error'
        );

        return;
    }

    try {
        const response = await authenticatedFetch(
            `/api/assignments/${assignmentId}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    ...assignment,
                    status: 'Complete'
                })
            }
        );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                'Unable to update assignment.'
            );
        }

        if (
            editingAssignmentId ===
            assignmentId
        ) {
            resetAssignmentForm();
        }

        showAssignmentMessage(
            `${result.title} was marked complete.`,
            'success'
        );

        await loadAssignments();
    } catch (error) {
        showAssignmentMessage(
            error.message,
            'error'
        );
    }
}

async function deleteAssignment(assignmentId) {
    if (
        !window.confirm(
            'Delete this assignment?'
        )
    ) {
        return;
    }

    try {
        const response = await authenticatedFetch(
            `/api/assignments/${assignmentId}`,
            {
                method: 'DELETE'
            }
        );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                'Unable to delete assignment.'
            );
        }

        if (
            editingAssignmentId ===
            assignmentId
        ) {
            resetAssignmentForm();
        }

        showAssignmentMessage(
            result.message,
            'success'
        );

        await loadAssignments();
    } catch (error) {
        showAssignmentMessage(
            error.message,
            'error'
        );
    }
}

function resetAssignmentForm() {
    editingAssignmentId = null;

    assignmentForm.reset();

    assignmentFormHeading.textContent =
        'Add Assignment';

    document.getElementById(
        'assignment-submit-button'
    ).textContent = 'Add Assignment';

    cancelEditButton.classList.add(
        'hidden'
    );
}

function clearAssignmentControls() {
    assignmentSearch.value = '';
    statusFilter.value = 'All';

    assignmentSort.value =
        'due-ascending';

    displayAssignments();
}

function updateVisibleAssignmentCount(count) {
    visibleAssignmentCount.textContent =
        `${count} ${
            count === 1
                ? 'assignment'
                : 'assignments'
        }`;
}

function showAssignmentMessage(
    message,
    className
) {
    assignmentMessage.textContent =
        message;

    assignmentMessage.className =
        `form-message ${className}`.trim();
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

function parseDate(dateValue) {
    if (!dateValue) {
        return new Date(
            8640000000000000
        );
    }

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

statusFilter.addEventListener(
    'change',
    displayAssignments
);

assignmentSearch.addEventListener(
    'input',
    displayAssignments
);

assignmentSort.addEventListener(
    'change',
    displayAssignments
);

clearFiltersButton.addEventListener(
    'click',
    clearAssignmentControls
);

cancelEditButton.addEventListener(
    'click',
    resetAssignmentForm
);

listViewButton.addEventListener(
    'click',
    () => {
        switchAssignmentView('list');
    }
);

calendarViewButton.addEventListener(
    'click',
    () => {
        switchAssignmentView('calendar');
    }
);

window.addEventListener(
    'duetrack-theme-change',
    () => {
        if (assignmentCalendar) {
            renderAssignmentCalendar();
        }
    }
);

document.addEventListener(
    'DOMContentLoaded',
    initializeAssignmentsPage
);

async function initializeAssignmentsPage() {
    try {
        const currentUser =
            await Auth.requireAuthentication();

        if (!currentUser) {
            return;
        }

        displayLoggedInUser(currentUser);
        setupLogoutButton();

        const savedAssignmentView =
            localStorage.getItem(
                'duetrack-assignment-view'
            );

        switchAssignmentView(
            savedAssignmentView === 'calendar'
                ? 'calendar'
                : 'list'
        );

        await Promise.all([
            loadCourses(),
            loadAssignments()
        ]);
    } catch (error) {
        console.error(
            'Unable to initialize the assignments page:',
            error
        );

        showAssignmentMessage(
            error.message ||
            'Unable to load the assignments page.',
            'error'
        );

        if (assignmentList) {
            assignmentList.innerHTML = `
                <div class="empty-state">
                    <p class="error">
                        ${escapeHtml(
                            error.message ||
                            'Unable to load assignments.'
                        )}
                    </p>
                </div>
            `;
        }

        displayCalendarError(
            error.message ||
            'Unable to load the assignment calendar.'
        );
    }
}

function displayLoggedInUser(user) {
    const loggedInUserElement =
        document.getElementById(
            'logged-in-user'
        );

    if (!loggedInUserElement) {
        return;
    }

    const displayName =
        Auth.getUserDisplayName(user);

    loggedInUserElement.textContent =
        `Hi, ${displayName}`;
}

function setupLogoutButton() {
    const logoutButton =
        document.getElementById(
            'logout-button'
        );

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener(
        'click',
        async () => {
            logoutButton.disabled = true;
            logoutButton.textContent =
                'Logging out...';

            await Auth.handleLogout();
        }
    );
}

async function authenticatedFetch(
    url,
    options = {}
) {
    const response = await fetch(
        url,
        {
            ...options,
            credentials: 'include',
            headers: {
                ...(options.headers || {})
            }
        }
    );

    if (response.status === 401) {
        window.location.replace(
            'login.html'
        );

        throw new Error(
            'Your session has expired. Please sign in again.'
        );
    }

    return response;
}