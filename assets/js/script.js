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
