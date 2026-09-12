document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // SMOOTH SCROLL (WITH DYNAMIC STICKY HEADER OFFSET)
    // =========================================================
    function scrollToTarget(target, href) {
        const stickyHeader = document.querySelector('.site-sticky-header');
        const headerOffset = stickyHeader ? stickyHeader.offsetHeight : 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 16;

        window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
        });

        if (href && history.pushState) {
            history.pushState(null, null, href);
        }

        // Highlight checkout container when scrolled into view
        const checkoutBox = target.id === 'checkout' ? target : target.querySelector('#checkout');
        if (checkoutBox) {
            checkoutBox.classList.remove('checkout-highlight');
            void checkoutBox.offsetWidth;
            checkoutBox.classList.add('checkout-highlight');
        }
        if (typeof exitOverlay !== 'undefined' && exitOverlay) {
            exitOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        // Show/hide sticky CTA
        if (typeof stickyCTA !== 'undefined' && stickyCTA) {
            if (target.id === 'checkout' || target.closest('#pricing')) {
                stickyCTA.classList.remove('visible');
            } else {
                stickyCTA.classList.add('visible');
            }
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                scrollToTarget(target, href);
            }
        });
    });

    // Handle initial hash on load (e.g. index.html#checkout)
    if (window.location.hash) {
        setTimeout(() => {
            const initialTarget = document.querySelector(window.location.hash);
            if (initialTarget) {
                scrollToTarget(initialTarget);
            }
        }, 150);
    }

    // =========================================================
    // NAVBAR SCROLL EFFECT
    // =========================================================
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(12, 13, 16, 0.9)';
            navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(12, 13, 16, 0.7)';
            navbar.style.boxShadow = 'none';
        }
    });

    // =========================================================
    // COUNTDOWN TIMER (synced via localStorage)
    // =========================================================
    const COUNTDOWN_KEY = 'alen_pbr_deadline';
    const DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    function getDeadline() {
        let deadline = localStorage.getItem(COUNTDOWN_KEY);
        if (!deadline) {
            deadline = Date.now() + DURATION_MS;
            localStorage.setItem(COUNTDOWN_KEY, deadline);
        }
        return parseInt(deadline);
    }

    const deadline = getDeadline();

    function pad(n) { return String(n).padStart(2, '0'); }

    function updateCountdowns() {
        const remaining = Math.max(0, deadline - Date.now());
        const h = Math.floor(remaining / 3_600_000);
        const m = Math.floor((remaining % 3_600_000) / 60_000);
        const s = Math.floor((remaining % 60_000) / 1_000);

        // Announcement bar
        const cdH = document.getElementById('cd-hours');
        const cdM = document.getElementById('cd-mins');
        const cdS = document.getElementById('cd-secs');
        if (cdH) cdH.textContent = pad(h);
        if (cdM) cdM.textContent = pad(m);
        if (cdS) cdS.textContent = pad(s);

        // Pricing section
        const pcH = document.getElementById('pc-hours');
        const pcM = document.getElementById('pc-mins');
        const pcS = document.getElementById('pc-secs');
        if (pcH) pcH.textContent = pad(h);
        if (pcM) pcM.textContent = pad(m);
        if (pcS) pcS.textContent = pad(s);

        // Exit popup
        const exH = document.getElementById('exit-hours');
        const exM = document.getElementById('exit-mins');
        const exS = document.getElementById('exit-secs');
        if (exH) exH.textContent = pad(h);
        if (exM) exM.textContent = pad(m);
        if (exS) exS.textContent = pad(s);

        // If expired, reset
        if (remaining === 0) {
            localStorage.removeItem(COUNTDOWN_KEY);
        }
    }

    updateCountdowns();
    setInterval(updateCountdowns, 1000);

    // =========================================================
    // LICENSES COUNTDOWN (urgency counter)
    // =========================================================
    const LICENSES_KEY = 'alen_pbr_licenses';
    let licenses = parseInt(localStorage.getItem(LICENSES_KEY) || '17');
    const licensesEl = document.getElementById('licensesLeft');
    if (licensesEl) licensesEl.textContent = licenses;

    // Slowly decrease licenses count (visual trick)
    function decreaseLicenses() {
        if (licenses > 5) {
            const delay = Math.random() * 60_000 + 90_000; // 1.5 - 2.5 min
            setTimeout(() => {
                licenses = Math.max(5, licenses - 1);
                localStorage.setItem(LICENSES_KEY, licenses);
                if (licensesEl) {
                    licensesEl.textContent = licenses;
                    licensesEl.style.animation = 'none';
                    licensesEl.offsetHeight; // reflow
                    licensesEl.style.animation = 'urgency-pulse 0.5s ease';
                }
                decreaseLicenses();
            }, delay);
        }
    }
    decreaseLicenses();

    // =========================================================
    // STICKY MOBILE CTA
    // =========================================================
    const stickyCTA = document.getElementById('stickyCTA');
    let stickyShown = false;

    if (stickyCTA) {
        const showSticky = () => {
            if (!stickyShown && window.scrollY > 300) {
                stickyCTA.classList.add('visible');
                stickyShown = true;
            }
        };

        window.addEventListener('scroll', showSticky, { passive: true });

        // Hide sticky when pricing or checkout section is visible
        const pricingSection = document.getElementById('pricing');
        const checkoutSection = document.getElementById('checkout');
        if (pricingSection || checkoutSection) {
            const pricingObserver = new IntersectionObserver((entries) => {
                const isVisible = entries.some(entry => entry.isIntersecting);
                if (isVisible) {
                    stickyCTA.classList.remove('visible');
                } else if (stickyShown) {
                    stickyCTA.classList.add('visible');
                }
            }, { threshold: 0.1 });
            if (pricingSection) pricingObserver.observe(pricingSection);
            if (checkoutSection) pricingObserver.observe(checkoutSection);
        }

        // Close sticky CTA on X click
        const stickyClose = document.getElementById('stickyClose');
        if (stickyClose) {
            stickyClose.addEventListener('click', (e) => {
                e.stopPropagation();
                stickyCTA.classList.remove('visible');
                stickyShown = false;
            });
        }
    }

    // =========================================================
    // EXIT INTENT POPUP
    // =========================================================
    const exitOverlay = document.getElementById('exitOverlay');
    const exitClose = document.getElementById('exitClose');
    const exitDismiss = document.getElementById('exitDismiss');
    const exitCTA = document.getElementById('exitCTA');
    const EXIT_SHOWN_KEY = 'alen_pbr_exit_shown';

    let exitShown = sessionStorage.getItem(EXIT_SHOWN_KEY) === '1';

    function showExitPopup() {
        if (!exitShown && exitOverlay) {
            exitShown = true;
            sessionStorage.setItem(EXIT_SHOWN_KEY, '1');
            exitOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeExitPopup() {
        if (exitOverlay) {
            exitOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Trigger on mouse leaving viewport (desktop)
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 10 && !exitShown) {
            setTimeout(showExitPopup, 200);
        }
    });

    // Trigger on mobile after 45s of inactivity
    let mobileTimer;
    function resetMobileTimer() {
        clearTimeout(mobileTimer);
        mobileTimer = setTimeout(() => {
            if (window.innerWidth <= 900) showExitPopup();
        }, 45_000);
    }
    ['scroll', 'touchstart', 'click'].forEach(ev => {
        window.addEventListener(ev, resetMobileTimer, { passive: true });
    });
    resetMobileTimer();

    if (exitClose) exitClose.addEventListener('click', closeExitPopup);
    if (exitDismiss) exitDismiss.addEventListener('click', closeExitPopup);
    if (exitCTA) exitCTA.addEventListener('click', closeExitPopup);

    // Close on overlay click
    if (exitOverlay) {
        exitOverlay.addEventListener('click', (e) => {
            if (e.target === exitOverlay) closeExitPopup();
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeExitPopup();
    });

    // =========================================================
    // SCROLL ANIMATIONS (IntersectionObserver)
    // =========================================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right').forEach(el => observer.observe(el));

    // =========================================================
    // COPY BUTTONS
    // =========================================================
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', function () {
            const original = this.innerHTML;
            this.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            this.style.color = '#22c55e';
            this.style.borderColor = '#22c55e';
            setTimeout(() => {
                this.innerHTML = original;
                this.style.color = 'white';
                this.style.borderColor = 'var(--clr-border)';
            }, 2000);
        });
    });

});
