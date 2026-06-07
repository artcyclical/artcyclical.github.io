document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;

        const scrollToTarget = () => {
            const floatingNav = document.getElementById('floatingNav');
            const navOffset = floatingNav ? floatingNav.offsetHeight : 0;
            const targetTop = Math.max(0, window.scrollY + target.getBoundingClientRect().top - navOffset);

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
        };

        const navMenu = document.getElementById('floatingNavMenu');
        if (navMenu && navMenu.classList.contains('show') && window.bootstrap?.Collapse) {
            const collapse = window.bootstrap.Collapse.getOrCreateInstance(navMenu);
            let didScroll = false;
            const runScrollOnce = () => {
                if (didScroll) return;
                didScroll = true;
                scrollToTarget();
            };

            navMenu.addEventListener('hidden.bs.collapse', runScrollOnce, { once: true });
            // Fallback for mobile browsers where the collapse event can be unreliable.
            window.setTimeout(runScrollOnce, 380);
            collapse.hide();
            return;
        }

        scrollToTarget();
    });
});

(() => {
    const THEME_KEY = 'artcyclical-theme';
    const getSavedTheme = () => {
        try {
            return localStorage.getItem(THEME_KEY);
        } catch {
            return null;
        }
    };

    const saveTheme = (theme) => {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {
            // Ignore storage errors (private mode / blocked storage).
        }
    };

    const initThemeToggle = () => {
        const body = document.body;
        const root = document.documentElement;
        const nav = document.getElementById('floatingNav');
        const toggle = document.getElementById('themeToggle');
        const logo = document.getElementById('brandLogo');

        if (!body) return;

        const applyTheme = (theme, persist = true) => {
            const isLight = theme === 'light';
            root.classList.toggle('theme-light', isLight);
            root.classList.toggle('theme-dark', !isLight);
            body.classList.toggle('theme-light', isLight);
            body.classList.toggle('theme-dark', !isLight);

            if (nav) {
                nav.classList.toggle('navbar-light', isLight);
                nav.classList.toggle('navbar-dark', !isLight);
            }

            if (logo) {
                logo.src = isLight ? 'assets/img/logo-light.svg' : 'assets/img/logo-dark.svg';
            }

            if (toggle) {
                toggle.checked = isLight;
            }

            if (persist) {
                saveTheme(isLight ? 'light' : 'dark');
            }
        };

        const savedTheme = getSavedTheme();
        const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
        const preloadedTheme = document.documentElement.classList.contains('theme-light')
            ? 'light'
            : document.documentElement.classList.contains('theme-dark')
                ? 'dark'
                : null;
        const initialTheme = savedTheme || preloadedTheme || (prefersLight ? 'light' : 'dark');
        applyTheme(initialTheme, false);

        if (toggle) {
            const handleToggle = () => {
                applyTheme(toggle.checked ? 'light' : 'dark');
            };

            // Use both events so touch-driven mobile interactions update immediately.
            toggle.addEventListener('input', handleToggle);
            toggle.addEventListener('change', handleToggle);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeToggle, { once: true });
        return;
    }

    initThemeToggle();
})();
