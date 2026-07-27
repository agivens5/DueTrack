"use strict";

const courseForm =
    document.getElementById("course-form");

const courseList =
    document.getElementById("course-list");

const courseMessage =
    document.getElementById("course-message");

let editingCourseId = null;

document.addEventListener(
    "DOMContentLoaded",
    initializeCoursesPage
);

async function initializeCoursesPage() {
    try {
        const currentUser =
            await Auth.requireAuthentication();

        if (!currentUser) {
            return;
        }

        displayLoggedInUser(currentUser);
        setupLogoutButton();
        setupCourseForm();

        await loadCourses();
    } catch (error) {
        console.error(
            "Unable to initialize the courses page:",
            error
        );

        displayCourseError(
            error.message ||
            "Unable to load the courses page."
        );
    }
}

function displayLoggedInUser(user) {
    const loggedInUserElement =
        document.getElementById(
            "logged-in-user"
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
            "logout-button"
        );

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener(
        "click",
        async () => {
            logoutButton.disabled = true;
            logoutButton.textContent =
                "Logging out...";

            await Auth.handleLogout();
        }
    );
}

function setupCourseForm() {
    if (!courseForm) {
        return;
    }

    courseForm.addEventListener(
        "submit",
        handleCourseSubmit
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

            credentials: "include",

            headers: {
                ...(options.headers || {})
            }
        }
    );

    if (response.status === 401) {
        window.location.replace(
            "login.html"
        );

        throw new Error(
            "Your session has expired. Please sign in again."
        );
    }

    return response;
}

async function loadCourses() {
    if (!courseList) {
        return;
    }

    courseList.innerHTML = `
        <div class="empty-state">
            <p>Loading courses...</p>
        </div>
    `;

    try {
        const response =
            await authenticatedFetch(
                "/api/courses"
            );

        if (!response.ok) {
            const result =
                await readJsonResponse(
                    response
                );

            throw new Error(
                result.error ||
                "Unable to load courses."
            );
        }

        const courses =
            await response.json();

        displayCourses(courses);
    } catch (error) {
        courseList.innerHTML = `
            <div class="empty-state">
                <p class="error">
                    ${escapeHtml(
                        error.message
                    )}
                </p>
            </div>
        `;
    }
}

function displayCourses(courses) {
    if (!courseList) {
        return;
    }

    if (courses.length === 0) {
        courseList.innerHTML = `
            <div class="empty-state">
                <span
                    class="empty-state-icon"
                    aria-hidden="true"
                >
                    📚
                </span>

                <h3>No courses yet</h3>

                <p>
                    Add your first course using the
                    form above.
                </p>
            </div>
        `;

        return;
    }

    courseList.innerHTML =
        courses
            .map(course => `
                <article class="list-card">
                    <h3>
                        ${escapeHtml(
                            course.course_name
                        )}
                    </h3>

                    <p>
                        <strong>
                            Instructor:
                        </strong>

                        ${escapeHtml(
                            course.instructor ||
                            "Not entered"
                        )}
                    </p>

                    <p>
                        <strong>
                            Semester:
                        </strong>

                        ${escapeHtml(
                            course.semester ||
                            "Not entered"
                        )}
                    </p>

                    <div class="card-actions">
                        <button
                            type="button"
                            class="edit-course-button"
                            data-course-id="${
                                course.course_id
                            }"
                            data-course-name="${escapeHtmlAttribute(
                                course.course_name
                            )}"
                            data-instructor="${escapeHtmlAttribute(
                                course.instructor ||
                                ""
                            )}"
                            data-semester="${escapeHtmlAttribute(
                                course.semester ||
                                ""
                            )}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="
                                danger-button
                                delete-course-button
                            "
                            data-course-id="${
                                course.course_id
                            }"
                        >
                            Delete
                        </button>
                    </div>
                </article>
            `)
            .join("");

    setupCourseActionButtons();
}

function setupCourseActionButtons() {
    const editButtons =
        document.querySelectorAll(
            ".edit-course-button"
        );

    const deleteButtons =
        document.querySelectorAll(
            ".delete-course-button"
        );

    editButtons.forEach(button => {
        button.addEventListener(
            "click",
            () => {
                editCourse(
                    Number(
                        button.dataset.courseId
                    ),
                    button.dataset.courseName,
                    button.dataset.instructor,
                    button.dataset.semester
                );
            }
        );
    });

    deleteButtons.forEach(button => {
        button.addEventListener(
            "click",
            () => {
                deleteCourse(
                    Number(
                        button.dataset.courseId
                    )
                );
            }
        );
    });
}

async function handleCourseSubmit(event) {
    event.preventDefault();

    clearCourseMessage();

    const courseNameInput =
        document.getElementById(
            "course-name"
        );

    const instructorInput =
        document.getElementById(
            "instructor"
        );

    const semesterInput =
        document.getElementById(
            "semester"
        );

    const course = {
        course_name:
            courseNameInput.value.trim(),

        instructor:
            instructorInput.value.trim(),

        semester:
            semesterInput.value.trim()
    };

    if (!course.course_name) {
        displayCourseError(
            "Course name is required."
        );

        courseNameInput.focus();

        return;
    }

    const isEditing =
        editingCourseId !== null;

    const url = isEditing
        ? `/api/courses/${editingCourseId}`
        : "/api/courses";

    const method = isEditing
        ? "PUT"
        : "POST";

    const submitButton =
        courseForm.querySelector(
            'button[type="submit"]'
        );

    const originalButtonText =
        submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent =
        isEditing
            ? "Updating..."
            : "Adding...";

    try {
        const response =
            await authenticatedFetch(
                url,
                {
                    method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(course)
                }
            );

        const result =
            await readJsonResponse(
                response
            );

        if (!response.ok) {
            throw new Error(
                result.error ||
                `Unable to ${
                    isEditing
                        ? "update"
                        : "add"
                } course.`
            );
        }

        displayCourseSuccess(
            isEditing
                ? `${result.course_name} was updated successfully.`
                : `${result.course_name} was added successfully.`
        );

        resetCourseForm();

        await loadCourses();
    } catch (error) {
        displayCourseError(
            error.message
        );
    } finally {
        submitButton.disabled = false;

        if (editingCourseId !== null) {
            submitButton.textContent =
                "Update Course";
        } else {
            submitButton.textContent =
                "Add Course";
        }

        if (
            !submitButton.textContent.trim()
        ) {
            submitButton.textContent =
                originalButtonText;
        }
    }
}

function editCourse(
    courseId,
    courseName,
    instructor,
    semester
) {
    editingCourseId = courseId;

    document.getElementById(
        "course-name"
    ).value = courseName;

    document.getElementById(
        "instructor"
    ).value = instructor;

    document.getElementById(
        "semester"
    ).value = semester;

    const submitButton =
        courseForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.textContent =
        "Update Course";

    if (courseMessage) {
        courseMessage.textContent =
            "Edit the course information, then click Update Course.";

        courseMessage.className =
            "form-message";
    }

    courseForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    document.getElementById(
        "course-name"
    ).focus();
}

async function deleteCourse(courseId) {
    const confirmed =
        window.confirm(
            "Delete this course? Assignments connected to it may remain in the database."
        );

    if (!confirmed) {
        return;
    }

    clearCourseMessage();

    try {
        const response =
            await authenticatedFetch(
                `/api/courses/${courseId}`,
                {
                    method: "DELETE"
                }
            );

        const result =
            await readJsonResponse(
                response
            );

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Unable to delete course."
            );
        }

        if (
            editingCourseId === courseId
        ) {
            resetCourseForm();
        }

        displayCourseSuccess(
            result.message ||
            "Course deleted successfully."
        );

        await loadCourses();
    } catch (error) {
        displayCourseError(
            error.message
        );
    }
}

function resetCourseForm() {
    editingCourseId = null;

    if (!courseForm) {
        return;
    }

    courseForm.reset();

    const submitButton =
        courseForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.textContent =
        "Add Course";
}

function clearCourseMessage() {
    if (!courseMessage) {
        return;
    }

    courseMessage.textContent = "";
    courseMessage.className =
        "form-message";
}

function displayCourseSuccess(message) {
    if (!courseMessage) {
        return;
    }

    courseMessage.textContent = message;
    courseMessage.className =
        "form-message success";
}

function displayCourseError(message) {
    if (!courseMessage) {
        return;
    }

    courseMessage.textContent = message;
    courseMessage.className =
        "form-message error";
}

async function readJsonResponse(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function escapeHtml(value) {
    const element =
        document.createElement("div");

    element.textContent = value ?? "";

    return element.innerHTML;
}

function escapeHtmlAttribute(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\n", " ");
}