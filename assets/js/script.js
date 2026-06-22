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
    const hero = document.querySelector('.hero-content');
    if (!hero || !('IntersectionObserver' in window)) return;

    let wasOutOfView = false;

    const replayHeroAnimation = () => {
        hero.style.animation = 'none';
        void hero.offsetHeight;
        hero.style.animation = '';
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.target !== hero) return;

            if (!entry.isIntersecting) {
                wasOutOfView = true;
                return;
            }

            if (wasOutOfView) {
                replayHeroAnimation();
            }

            wasOutOfView = false;
        });
    }, {
        threshold: 0.2
    });

    observer.observe(hero);
})();

(() => {
    const CONSENT_KEY = 'artcyclical-cookie-consent';

    const initGdprConsent = () => {
        const banner = document.getElementById('gdprConsent');
        const acceptBtn = document.getElementById('gdprAccept');
        const rejectBtn = document.getElementById('gdprReject');

        if (!banner || !acceptBtn || !rejectBtn) return;

        const readConsent = () => {
            try {
                return localStorage.getItem(CONSENT_KEY);
            } catch {
                return null;
            }
        };

        const writeConsent = (value) => {
            try {
                localStorage.setItem(CONSENT_KEY, value);
            } catch {
                // Ignore storage write failures.
            }
        };

        const hideBanner = () => {
            banner.classList.remove('is-visible');
            window.setTimeout(() => {
                banner.hidden = true;
            }, 280);
        };

        const saveChoice = (value) => {
            writeConsent(value);
            hideBanner();
        };

        const existingConsent = readConsent();
        if (existingConsent === 'accepted' || existingConsent === 'rejected') {
            banner.hidden = true;
            return;
        }

        banner.hidden = false;
        window.requestAnimationFrame(() => {
            banner.classList.add('is-visible');
        });

        acceptBtn.addEventListener('click', () => saveChoice('accepted'));
        rejectBtn.addEventListener('click', () => saveChoice('rejected'));
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGdprConsent, { once: true });
    } else {
        initGdprConsent();
    }
})();

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
        const footerLogo = document.getElementById('footerLogo');
        const themedImages = document.querySelectorAll('img[data-theme-light-src][data-theme-dark-src]');

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

            if (footerLogo) {
                footerLogo.src = isLight ? 'assets/img/logo-light.svg' : 'assets/img/logo-dark.svg';
            }

            themedImages.forEach((image) => {
                const nextSrc = isLight ? image.dataset.themeLightSrc : image.dataset.themeDarkSrc;
                if (nextSrc && image.getAttribute('src') !== nextSrc) {
                    image.setAttribute('src', nextSrc);
                }
            });

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

// Load and display content from JSON
(() => {
    const loadSiteData = async () => {
        try {
            const response = await fetch('assets/data/site_data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            // Display featured items
            displayFeaturedItems(data.featured_items);
            
            // Display testimonials
            displayTestimonials(data.testimonials);
            
            // Display services
            displayServices(data.services);
        } catch (error) {
            console.error('Error loading site data:', error);
        }
    };

    const displayFeaturedItems = (items) => {
        const container = document.getElementById('items-container');
        if (!container) return;

        container.innerHTML = items.map(item => `
            <div class="col-md-4 mb-4">
                <div class="card h-100 border-0 shadow-sm theme-card pt-4">
                    <img src="${item.image}" class="card-img-top" alt="${item.name}">
                    <div class="card-body">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text">${item.description}</p>
                        <p class="card-text"><strong>${item.price}</strong></p>
                        <span class="badge bg-${item.status === 'Sold' ? 'danger' : 'success'}">${item.status}</span>
                    </div>
                </div>
            </div>
        `).join('');
    };

    const displayTestimonials = (testimonials) => {
        const container = document.getElementById('testimonials-container');
        if (!container) return;

        container.innerHTML = testimonials.map(testimonial => `
            <div class="col-md-4 mb-4">
                <div class="card h-100 border-0 theme-card pt-4">
                    <div class="card-body">
                        <div class="mb-2">
                            ${'★'.repeat(testimonial.rating)}
                        </div>
                        <p class="card-text fs-5 fw-lighter">"${testimonial.text}"</p>
                        <p class="card-text fw-semibold">— ${testimonial.author}</p>
                    </div>
                </div>
            </div>
        `).join('');
    };

    const displayServices = (services) => {
        const container = document.getElementById('services-container');
        if (!container) return;

        const serviceAosDirections = ['fade-right', 'fade-down', 'fade-left'];

        container.innerHTML = services.map((service, index) => {
            const direction = serviceAosDirections[index % serviceAosDirections.length];
            return `
            <div class="col-md-4 mb-4" data-aos="${direction}" data-aos-delay="${200 + index * 120}">
                <div class="text-center">
                    <img src="${service.image}" alt="${service.title}" class="img-fluid mb-3 rounded">
                    <h4 class="fs-3 fw-semibold">${service.title}</h4>
                    <p class="fs-4">${service.description}</p>
                </div>
            </div>
        `;
        }).join('');
    };

    // Load data when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSiteData);
    } else {
        loadSiteData();
    }
})();
