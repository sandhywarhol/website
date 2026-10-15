document.addEventListener('DOMContentLoaded', () => {
    // Hero scroll-zoom: progress 0..1 across the pinned track
    const heroTrack = document.getElementById('hero-track');
    const heroBg = document.querySelector('.hero-bg');
    const heroFrame = document.querySelector('.hero-frame');
    if (heroTrack && heroBg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const heroDim = document.querySelector('.hero-dim');
        const heroContent = document.querySelector('.hero-track .hero-container');
        const heroReveal = document.querySelector('.hero-reveal');
        const heroHint = document.querySelector('.hero-scroll-hint');
        const revealItems = heroReveal ? [...heroReveal.children] : [];
        const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
        const seg = (p, a, b) => clamp((p - a) / (b - a));
        const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const MAX_FRAME_SCALE = window.innerWidth < 992 ? 7 : 6;
        const MAX_BG_SCALE = 1.12;
        let ticking = false;

        const updateHero = () => {
            ticking = false;
            const total = heroTrack.offsetHeight - window.innerHeight;
            const p = clamp(-heroTrack.getBoundingClientRect().top / total);

            // Zoom runs most of the track; dim and reveal follow it
            // Leaf frame does the big zoom; the background only eases in slightly
            const zoom = easeInOut(seg(p, 0, 0.8));
            heroFrame.style.transform = `scale(${1 + (MAX_FRAME_SCALE - 1) * zoom})`;
            heroFrame.style.opacity = (1 - seg(p, 0.7, 0.8)).toFixed(3);
            heroBg.style.transform = `scale(${1 + (MAX_BG_SCALE - 1) * seg(p, 0, 0.9)})`;
            heroDim.style.opacity = (0.55 * seg(p, 0.3, 0.65)).toFixed(3);

            const out = seg(p, 0, 0.22);
            heroContent.style.opacity = (1 - out).toFixed(3);
            heroContent.style.transform = `translateY(${-40 * out}px) scale(${1 + 0.08 * out})`;
            if (heroHint) heroHint.style.opacity = (1 - seg(p, 0, 0.08)).toFixed(3);

            heroReveal.style.opacity = seg(p, 0.4, 0.45) > 0 ? '1' : '0';
            heroReveal.style.pointerEvents = p > 0.6 ? 'auto' : 'none';
            revealItems.forEach((el, i) => {
                const t = easeInOut(seg(p, 0.45 + i * 0.07, 0.62 + i * 0.07));
                el.style.opacity = t.toFixed(3);
                el.style.transform = `translateY(${28 * (1 - t)}px)`;
            });
        };

        const requestUpdate = () => {
            if (!ticking) { ticking = true; requestAnimationFrame(updateHero); }
        };
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);
        updateHero();
    }

    // Custom Cursor - Enhanced tracking and dynamic interaction
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        let isCursorVisible = false;

        document.addEventListener('mousemove', (e) => {
            if (!isCursorVisible) {
                cursor.classList.add('visible');
                isCursorVisible = true;
            }
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.addEventListener('mouseleave', () => {
            cursor.classList.remove('visible');
            isCursorVisible = false;
        });

        document.addEventListener('mouseenter', () => {
            cursor.classList.add('visible');
            isCursorVisible = true;
        });

        document.addEventListener('mousedown', () => {
            cursor.classList.add('clicking');
        });

        document.addEventListener('mouseup', () => {
            cursor.classList.remove('clicking');
        });

        // Dynamic event delegation for interactive elements
        const interactiveSelector = 'a, button, [role="button"], input, select, textarea, .brand-partner-item, .contact-channel-row, .btn-contact-action, .app-module-card, .ct-mod-row, .lead-node, .pd-card, .mini-card, .contact-item, .cal-nav-btn, .cal-day, .dock-btn';
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactiveSelector)) {
                cursor.classList.add('hover');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactiveSelector)) {
                cursor.classList.remove('hover');
            }
        });
    }

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav a');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            
            // Prevent scrolling when menu is open
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Scroll Animations (Fade up)
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // Real-Time Calendar Rendering
    let calDate = new Date();

    const renderCalendar = (targetDate) => {
        const monthTitle = document.getElementById('cal-month-title');
        const grid = document.getElementById('cal-grid');
        if (!monthTitle || !grid) return;

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();
        monthTitle.textContent = `${months[month]} ${year}`;

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        const currentDay = today.getDate();

        // First day of current month (0: Sunday, 1: Monday, ...)
        const firstDayIndex = new Date(year, month, 1).getDay();
        // Days in current month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        // Days in previous month
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        let daysHtml = '';

        // Trailing days from previous month
        for (let i = firstDayIndex; i > 0; i--) {
            const prevDayNum = daysInPrevMonth - i + 1;
            daysHtml += `<div class="cal-day muted">${prevDayNum}</div>`;
        }

        // Days of current month
        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = isCurrentMonth && d === currentDay;
            const dayOfWeek = new Date(year, month, d).getDay();
            const isSunday = dayOfWeek === 0;
            const isFriOrSat = dayOfWeek === 5 || dayOfWeek === 6;

            let classes = 'cal-day';
            let titleText = '';

            if (isToday) {
                classes += ' active-day';
                titleText = 'Today';
            }

            if (isSunday) {
                classes += ' cal-sunday';
                titleText = titleText ? `${titleText} • Off (Sunday)` : 'Not Available (Sunday)';
            } else if (isFriOrSat) {
                classes += ' cal-black-dot';
                titleText = titleText ? `${titleText} • Studio Shoot (Fri/Sat)` : 'Not Available (Friday/Saturday)';
            } else {
                titleText = titleText || 'Available for Bookings';
            }

            daysHtml += `<div class="${classes}" title="${titleText}">${d}</div>`;
        }

        // Leading days from next month to fill grid
        const totalRendered = firstDayIndex + daysInMonth;
        const remainingCells = (7 - (totalRendered % 7)) % 7;
        for (let n = 1; n <= remainingCells; n++) {
            daysHtml += `<div class="cal-day muted">${n}</div>`;
        }

        grid.innerHTML = daysHtml;
    };

    renderCalendar(calDate);

    const prevBtn = document.getElementById('cal-prev');
    const nextBtn = document.getElementById('cal-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            calDate.setMonth(calDate.getMonth() - 1);
            renderCalendar(calDate);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            calDate.setMonth(calDate.getMonth() + 1);
            renderCalendar(calDate);
        });
    }

    // Real-Time Live Countdown to Upcoming Photoshoot Session
    const updateCountdown = () => {
        const daysEl = document.getElementById('pd-days');
        const hoursEl = document.getElementById('pd-hours');
        const minsEl = document.getElementById('pd-mins');
        const secsEl = document.getElementById('pd-secs');

        if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

        const now = new Date();
        // Target: next routine shoot (every Thursday at 09:00 AM local time)
        const target = new Date(now);
        const dayOfWeek = now.getDay();
        const daysUntilThursday = (4 - dayOfWeek + 7) % 7;
        target.setDate(now.getDate() + (daysUntilThursday === 0 && now.getHours() >= 9 ? 7 : daysUntilThursday));
        target.setHours(9, 0, 0, 0);

        const diff = target.getTime() - now.getTime();
        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minsEl.textContent = '00';
            secsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minsEl.textContent = String(mins).padStart(2, '0');
        secsEl.textContent = String(secs).padStart(2, '0');
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Capabilities Suite Switcher (View How I Work vs View End-to-End Production)
    const btnSuiteLead = document.getElementById('btn-suite-lead');
    const btnSuitePipeline = document.getElementById('btn-suite-pipeline');
    const suiteViewLead = document.getElementById('suite-view-lead');
    const suiteViewPipeline = document.getElementById('suite-view-pipeline');
    const suiteStatusTag = document.getElementById('suite-status-tag');

    if (btnSuiteLead && btnSuitePipeline && suiteViewLead && suiteViewPipeline) {
        btnSuiteLead.addEventListener('click', () => {
            btnSuiteLead.classList.add('active');
            btnSuitePipeline.classList.remove('active');
            suiteViewLead.classList.add('active');
            suiteViewLead.style.display = 'block';
            suiteViewPipeline.classList.remove('active');
            suiteViewPipeline.style.display = 'none';
            if (suiteStatusTag) suiteStatusTag.textContent = '6 Active Principles';
        });

        btnSuitePipeline.addEventListener('click', () => {
            btnSuitePipeline.classList.add('active');
            btnSuiteLead.classList.remove('active');
            suiteViewPipeline.classList.add('active');
            suiteViewPipeline.style.display = 'block';
            suiteViewLead.classList.remove('active');
            suiteViewLead.style.display = 'none';
            if (suiteStatusTag) suiteStatusTag.textContent = '8 Stage Gates';
        });
    }

    // App-Style Floating Bottom Dock Navigation & Scroll Spy (5 Buttons)
    const dockNav = document.getElementById('app-bottom-dock') || document.querySelector('.app-bottom-dock');
    const dockButtons = document.querySelectorAll('.app-bottom-dock .dock-btn');
    const profileSection = document.getElementById('profile');

    // Toggle Dock Visibility: Hidden in hero, visible when scrolled to profile section or below
    const updateDockVisibility = () => {
        if (!dockNav || !profileSection) return;
        const rect = profileSection.getBoundingClientRect();
        // Visible when profile section top is entering viewport (within 80% of window height)
        if (rect.top <= window.innerHeight * 0.8) {
            dockNav.classList.remove('dock-hidden');
        } else {
            dockNav.classList.add('dock-hidden');
        }
    };

    if (dockButtons.length > 0) {
        const trackedSections = [
            { id: 'profile', btn: document.getElementById('dock-btn-profile') },
            { id: 'capabilities', btn: document.getElementById('dock-btn-capabilities') },
            { id: 'work', btn: document.getElementById('dock-btn-work') },
            { id: 'experience', btn: document.getElementById('dock-btn-cv') },
            { id: 'contact', btn: document.getElementById('dock-btn-contact') }
        ];

        // Smooth navigation click handler
        dockButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = btn.getAttribute('data-target') || btn.getAttribute('href').replace('#', '');
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    e.preventDefault();
                    dockButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Scroll Spy to highlight the currently active section
        const updateActiveDock = () => {
            const scrollPos = window.scrollY + 200;
            const isBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 120);
            let currentActiveId = isBottom ? 'contact' : 'profile';

            if (!isBottom) {
                for (let i = trackedSections.length - 1; i >= 0; i--) {
                    const item = trackedSections[i];
                    const el = document.getElementById(item.id);
                    if (el) {
                        const elTop = el.offsetTop;
                        if (scrollPos >= elTop) {
                            currentActiveId = item.id;
                            break;
                        }
                    }
                }
            }

            trackedSections.forEach(item => {
                if (item.btn) {
                    if (item.id === currentActiveId) {
                        item.btn.classList.add('active');
                    } else {
                        item.btn.classList.remove('active');
                    }
                }
            });
        };

        const handleDockScroll = () => {
            updateDockVisibility();
            updateActiveDock();
        };

        window.addEventListener('scroll', handleDockScroll, { passive: true });
        window.addEventListener('resize', updateDockVisibility);

        // Initial run
        updateDockVisibility();
        updateActiveDock();
    } else if (dockNav && profileSection) {
        window.addEventListener('scroll', updateDockVisibility, { passive: true });
        window.addEventListener('resize', updateDockVisibility);
        updateDockVisibility();
    }

});



