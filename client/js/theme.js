const themeToggle = document.getElementById('theme-toggle');

const savedTheme = localStorage.getItem('duetrack-theme');

const systemPrefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
).matches;

const startingTheme =
    savedTheme || (systemPrefersDark ? 'dark' : 'light');

applyTheme(startingTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme =
            document.documentElement.dataset.theme || 'light';

        const newTheme =
            currentTheme === 'dark' ? 'light' : 'dark';

        applyTheme(newTheme);

        localStorage.setItem(
            'duetrack-theme',
            newTheme
        );
    });
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    if (themeToggle) {
        if (theme === 'dark') {
            themeToggle.textContent = '☀️ Light';

            themeToggle.setAttribute(
                'aria-label',
                'Switch to light mode'
            );
        } else {
            themeToggle.textContent = '🌙 Dark';

            themeToggle.setAttribute(
                'aria-label',
                'Switch to dark mode'
            );
        }
    }

    window.dispatchEvent(
        new CustomEvent('duetrack-theme-change', {
            detail: {
                theme
            }
        })
    );
}