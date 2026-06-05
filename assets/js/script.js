document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;

        const floatingNav = document.getElementById('floatingNav');
        const navOffset = floatingNav ? floatingNav.offsetHeight : 0;
        const targetTop = window.scrollY + target.getBoundingClientRect().top - navOffset;

        const navMenu = document.getElementById('floatingNavMenu');
        if (navMenu && navMenu.classList.contains('show') && window.bootstrap?.Collapse) {
            window.bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
        }

        if (window.anime) {
            window.anime({
                targets: [document.documentElement, document.body],
                scrollTop: targetTop,
                duration: 900,
                easing: 'easeInOutQuad'
            });
            return;
        }

        window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
        });
    });
});

(() => {
    const THEME_KEY = 'artcyclical-theme';
    const body = document.body;
    const nav = document.getElementById('floatingNav');
    const toggle = document.getElementById('themeToggle');
    const label = document.getElementById('themeToggleLabel');

    if (!body || !toggle || !label) return;

    const applyTheme = (theme) => {
        const isLight = theme === 'light';
        body.classList.toggle('theme-light', isLight);
        body.classList.toggle('theme-dark', !isLight);

        if (nav) {
            nav.classList.toggle('navbar-light', isLight);
            nav.classList.toggle('navbar-dark', !isLight);
        }

        toggle.checked = isLight;
        label.textContent = isLight ? 'Light Mode' : 'Dark Mode';
        localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
    };

    const savedTheme = localStorage.getItem(THEME_KEY);
    const initialTheme = savedTheme || 'dark';
    applyTheme(initialTheme);

    toggle.addEventListener('change', () => {
        applyTheme(toggle.checked ? 'light' : 'dark');
    });
})();
