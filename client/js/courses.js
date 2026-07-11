const courseForm = document.getElementById('course-form');
const courseList = document.getElementById('course-list');
const courseMessage = document.getElementById('course-message');

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
                <p><strong>Instructor:</strong> ${escapeHtml(course.instructor || 'Not entered')}</p>
                <p><strong>Semester:</strong> ${escapeHtml(course.semester || 'Not entered')}</p>
                <button class="danger-button" onclick="deleteCourse(${course.course_id})">
                    Delete
                </button>
            </article>
        `).join('');
    } catch (error) {
        courseList.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

courseForm.addEventListener('submit', async event => {
    event.preventDefault();

    const course = {
        course_name: document.getElementById('course-name').value.trim(),
        instructor: document.getElementById('instructor').value.trim(),
        semester: document.getElementById('semester').value.trim()
    };

    try {
        const response = await fetch('/api/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(course)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Unable to add course.');
        }

        courseMessage.textContent = `${result.course_name} was added successfully.`;
        courseMessage.className = 'success';

        courseForm.reset();
        await loadCourses();
    } catch (error) {
        courseMessage.textContent = error.message;
        courseMessage.className = 'error';
    }
});

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

        courseMessage.textContent = result.message;
        courseMessage.className = 'success';

        await loadCourses();
    } catch (error) {
        courseMessage.textContent = error.message;
        courseMessage.className = 'error';
    }
}

function escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = value ?? '';
    return element.innerHTML;
}

loadCourses();