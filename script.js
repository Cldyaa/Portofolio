// Ensure JS loaded class is present
document.documentElement.classList.add('js-loaded');

// Smooth scroll (handles valid anchors, ignores '#' to prevent querySelector crash)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        
        try {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            }
        } catch (err) {
            // Ignore invalid selector
        }
    });
});

// Active Navigation Highlight (ScrollSpy)
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');

if (sections.length && navLinks.length) {
    const updateActiveNav = () => {
        const scrollPosition = window.scrollY + 120;
        let currentSectionId = '';

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    };

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
}

// Section Entrance Animation (Hardware-accelerated class toggle with fallback)
const revealSections = document.querySelectorAll('.reveal-section');

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    revealSections.forEach(sec => revealObserver.observe(sec));
} else {
    // Fallback: immediately reveal if IntersectionObserver is not supported
    revealSections.forEach(sec => sec.classList.add('is-revealed'));
}

// Projects Carousel
const projectsCarousel = document.querySelector('#projects-carousel');
const projectsPrev = document.querySelector('#projects-prev');
const projectsNext = document.querySelector('#projects-next');

if (projectsCarousel && projectsPrev && projectsNext) {
    const updateCarouselButtons = () => {
        const maxScroll = projectsCarousel.scrollWidth - projectsCarousel.clientWidth;
        projectsPrev.disabled = projectsCarousel.scrollLeft <= 4;
        projectsNext.disabled = projectsCarousel.scrollLeft >= maxScroll - 4;
    };

    const scrollProjects = direction => {
        const card = projectsCarousel.querySelector('.project-card');
        if (!card) return;

        const gap = Number.parseFloat(getComputedStyle(projectsCarousel).gap) || 0;
        projectsCarousel.scrollBy({
            left: direction * (card.getBoundingClientRect().width + gap),
            behavior: 'smooth'
        });
        setTimeout(updateCarouselButtons, 350);
    };

    projectsPrev.addEventListener('click', () => scrollProjects(-1));
    projectsNext.addEventListener('click', () => scrollProjects(1));
    projectsCarousel.addEventListener('scroll', updateCarouselButtons, { passive: true });
    
    let resizeTimer;
    window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeTimer);
        resizeTimer = requestAnimationFrame(updateCarouselButtons);
    }, { passive: true });

    updateCarouselButtons();
}

// Journey Track Interaction (Drag to scroll with smooth state)
const twineTrack = document.querySelector('#twine-track');

if (twineTrack) {
    let isDown = false;
    let startX;
    let scrollLeft;

    twineTrack.addEventListener('mousedown', (e) => {
        isDown = true;
        twineTrack.classList.add('is-dragging');
        startX = e.pageX - twineTrack.offsetLeft;
        scrollLeft = twineTrack.scrollLeft;
    });

    const stopDragging = () => {
        if (!isDown) return;
        isDown = false;
        twineTrack.classList.remove('is-dragging');
    };

    window.addEventListener('mouseup', stopDragging);
    twineTrack.addEventListener('mouseleave', stopDragging);

    twineTrack.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - twineTrack.offsetLeft;
        const walk = (x - startX) * 1.5;
        twineTrack.scrollLeft = scrollLeft - walk;
    });
}

// Copy email interaction
const copyBtn = document.querySelector('#btn-copy-email');
const copyText = document.querySelector('#copy-text');
if (copyBtn && copyText) {
    copyBtn.addEventListener('click', () => {
        const email = copyBtn.getAttribute('data-email') || 'andriansaputri378@gmail.com';
        const onCopied = () => {
            copyText.textContent = 'Email Berhasil Disalin! ✓';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyText.textContent = 'Salin Alamat Email 📋';
                copyBtn.classList.remove('copied');
            }, 2200);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(email).then(onCopied).catch(() => {
                // Fallback
                const input = document.createElement('input');
                input.value = email;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                onCopied();
            });
        } else {
            const input = document.createElement('input');
            input.value = email;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            onCopied();
        }
    });
}