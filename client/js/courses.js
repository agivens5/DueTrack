const courseForm = document.getElementById('course-form');
const courseList = document.getElementById('course-list');
const courseMessage = document.getElementById('course-message');

let editingCourseId = null;

async function loadCourses() {
    try {
        const response = await fetch('/api/courses');

        if (!response.ok) {
            throw new Error('Unable to load courses.');
        }

        const courses = await response.json();

        if (courses.length === 0) {
            courseList.innerHTML = '<p>No courses have been added.</p>';
            return;
        }

        courseList.innerHTML = courses.map(course => `
            <article class="list-card">
                <h3>${escapeHtml(course.course_name)}</h3>

                <p>
                    <strong>Instructor:</strong>
                    ${escapeHtml(course.instructor || 'Not entered')}
                </p>

                <p>
                    <strong>Semester:</strong>
                    ${escapeHtml(course.semester || 'Not entered')}
                </p>

                <div class="card-actions">
                    <button
                        type="button"
                        onclick="editCourse(
                            ${course.course_id},
                            '${escapeForAttribute(course.course_name)}',
                            '${escapeForAttribute(course.instructor || '')}',
                            '${escapeForAttribute(course.semester || '')}'
                        )"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="danger-button"
                        onclick="deleteCourse(${course.course_id})"
                    >
                        Delete
                    </button>
                </div>
            </article>
        `).join('');
    } catch (error) {
        courseList.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
    }
}

courseForm.addEventListener('submit', async event => {
    event.preventDefault();

    const course = {
        course_name: document.getElementById('course-name').value.trim(),
        instructor: document.getElementById('instructor').value.trim(),
        semester: document.getElementById('semester').value.trim()
    };

    const isEditing = editingCourseId !== null;

    const url = isEditing
        ? `/api/courses/${editingCourseId}`
        : '/api/courses';

    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(course)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                `Unable to ${isEditing ? 'update' : 'add'} course.`
            );
        }

        courseMessage.textContent = isEditing
            ? `${result.course_name} was updated successfully.`
            : `${result.course_name} was added successfully.`;

        courseMessage.className = 'success';

        resetCourseForm();
        await loadCourses();
    } catch (error) {
        courseMessage.textContent = error.message;
        courseMessage.className = 'error';
    }
});

function editCourse(courseId, courseName, instructor, semester) {
    editingCourseId = courseId;

    document.getElementById('course-name').value = courseName;
    document.getElementById('instructor').value = instructor;
    document.getElementById('semester').value = semester;

    const submitButton = courseForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.textContent = 'Update Course';

    courseMessage.textContent =
        'Edit the course information, then click Update Course.';

    courseMessage.className = '';

    courseForm.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

async function deleteCourse(courseId) {
    const confirmed = window.confirm(
        'Delete this course? Assignments connected to it may remain in the database.'
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/courses/${courseId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Unable to delete course.');
        }

        if (editingCourseId === courseId) {
            resetCourseForm();
        }

        courseMessage.textContent = result.message;
        courseMessage.className = 'success';

        await loadCourses();
    } catch (error) {
        courseMessage.textContent = error.message;
        courseMessage.className = 'error';
    }
}

function resetCourseForm() {
    editingCourseId = null;
    courseForm.reset();

    const submitButton = courseForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.textContent = 'Add Course';
}

function escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = value ?? '';
    return element.innerHTML;
}

function escapeForAttribute(value) {
    return String(value ?? '')
        .replaceAll('\\', '\\\\')
        .replaceAll("'", "\\'")
        .replaceAll('\n', ' ');
}

loadCourses();