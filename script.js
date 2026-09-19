document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 0. TOP URGENCY BANNER COUNTDOWN TIMER
    // =========================================================
    const bannerTimer = document.getElementById('bannerTimer');
    if (bannerTimer) {
        const STORAGE_KEY = 'alen_pbr_timer_expiry';
        const DURATION_MS = (4 * 3600 + 29 * 60 + 18) * 1000; // 4h 29m 18s window
        let expiry = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();

        if (!expiry || now > parseInt(expiry, 10)) {
            expiry = now + DURATION_MS;
            localStorage.setItem(STORAGE_KEY, expiry.toString());
        } else {
            expiry = parseInt(expiry, 10);
        }

        const updateBannerCountdown = () => {
            const currentTime = Date.now();
            let remaining = Math.max(0, expiry - currentTime);

            if (remaining <= 0) {
                // Recycle fresh timer smoothly so it never stays 00:00:00
                expiry = Date.now() + DURATION_MS;
                localStorage.setItem(STORAGE_KEY, expiry.toString());
                remaining = DURATION_MS;
            }

            const totalSecs = Math.floor(remaining / 1000);
            const hours = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
            const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
            const secs = String(totalSecs % 60).padStart(2, '0');

            bannerTimer.textContent = `${hours}:${mins}:${secs}`;
        };

        updateBannerCountdown();
        setInterval(updateBannerCountdown, 1000);
    }

    // =========================================================
    // 1. SMOOTH SCROLL WITH DYNAMIC NAVBAR OFFSET
    // =========================================================
    function scrollToTarget(target, href) {
        const header = document.querySelector('.site-header');
        const headerOffset = header ? header.offsetHeight : 72;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 16;

        window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
        });

        if (href && history.pushState) {
            history.pushState(null, null, href);
        }

        // Highlight checkout buttons when targeted
        if (target.id === 'checkout') {
            target.classList.add('checkout-targeted');
            setTimeout(() => {
                target.classList.remove('checkout-targeted');
            }, 1800);
        } else if (target.id === 'pricing') {
            const pricingBox = target.querySelector('.pricing-box');
            if (pricingBox) {
                pricingBox.style.boxShadow = '0 0 50px rgba(0, 122, 255, 0.6)';
                setTimeout(() => {
                    pricingBox.style.boxShadow = '';
                }, 1800);
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

    // Handle direct URL hash landing (e.g. index.html#checkout)
    if (window.location.hash) {
        setTimeout(() => {
            const initialTarget = document.querySelector(window.location.hash);
            if (initialTarget) {
                scrollToTarget(initialTarget);
            }
        }, 200);
    }

    // =========================================================
    // 2. NAVBAR SCROLL EFFECT
    // =========================================================
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                navbar.style.background = 'rgba(7, 7, 9, 0.95)';
                navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';
            } else {
                navbar.style.background = 'rgba(7, 7, 9, 0.85)';
                navbar.style.boxShadow = 'none';
            }
        }, { passive: true });
    }

    // =========================================================
    // 3. FAQ ACCORDION INTERACTIVITY
    // =========================================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (!questionBtn) return;

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close other items (clean accordion behavior)
            faqItems.forEach(other => {
                if (other !== item) {
                    other.classList.remove('active');
                    const otherBtn = other.querySelector('.faq-question');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                }
            });

            if (isActive) {
                item.classList.remove('active');
                questionBtn.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('active');
                questionBtn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Open first FAQ by default
    if (faqItems.length > 0) {
        faqItems[0].classList.add('active');
        const firstBtn = faqItems[0].querySelector('.faq-question');
        if (firstBtn) firstBtn.setAttribute('aria-expanded', 'true');
    }

    // =========================================================
    // 4. STICKY MOBILE CTA BAR
    // =========================================================
    const stickyCTA = document.getElementById('stickyCTA');
    const stickyClose = document.getElementById('stickyClose');
    let stickyClosedByUser = false;

    if (stickyCTA) {
        const checkoutTarget = document.getElementById('checkout') || document.getElementById('pricing');

        const handleStickyScroll = () => {
            if (stickyClosedByUser || window.innerWidth > 768) {
                stickyCTA.classList.remove('visible');
                return;
            }

            const scrollY = window.scrollY;
            const heroHeight = 450;

            if (checkoutTarget) {
                const checkoutRect = checkoutTarget.getBoundingClientRect();
                const isNearCheckout = checkoutRect.top <= window.innerHeight && checkoutRect.bottom >= 0;
                if (isNearCheckout) {
                    stickyCTA.classList.remove('visible');
                    return;
                }
            }

            if (scrollY > heroHeight) {
                stickyCTA.classList.add('visible');
            } else {
                stickyCTA.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', handleStickyScroll, { passive: true });
        window.addEventListener('resize', handleStickyScroll, { passive: true });

        if (stickyClose) {
            stickyClose.addEventListener('click', (e) => {
                e.stopPropagation();
                stickyClosedByUser = true;
                stickyCTA.classList.remove('visible');
            });
        }
    }

    // =========================================================
    // 5. HERO VIDEO & D5 VIDEO CONTROLS (Zero Click Autoplay)
    // =========================================================
    const heroVideo = document.getElementById('heroVideo');
    const heroAudioToggle = document.getElementById('heroAudioToggle');
    const heroAudioIcon = document.getElementById('heroAudioIcon');
    const heroAudioText = document.getElementById('heroAudioText');

    if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.defaultMuted = true;
        const ensureHeroPlaying = () => {
            if (heroVideo.paused) {
                heroVideo.muted = true;
                heroVideo.play().catch(() => {});
            }
        };
        ensureHeroPlaying();
        ['loadedmetadata', 'canplay', 'touchstart', 'scroll'].forEach(evt => {
            window.addEventListener(evt, ensureHeroPlaying, { passive: true, once: true });
        });

        if (heroAudioToggle) {
            heroAudioToggle.addEventListener('click', () => {
                heroVideo.muted = !heroVideo.muted;
                if (!heroVideo.muted) {
                    heroVideo.volume = 1.0;
                    if (heroAudioIcon) heroAudioIcon.className = 'fa-solid fa-volume-high';
                    if (heroAudioText) heroAudioText.textContent = 'Audio Activado';
                    heroAudioToggle.classList.add('audio-active');
                } else {
                    if (heroAudioIcon) heroAudioIcon.className = 'fa-solid fa-volume-xmark';
                    if (heroAudioText) heroAudioText.textContent = 'Activar Sonido';
                    heroAudioToggle.classList.remove('audio-active');
                }
            });
        }
    }

    const d5Video = document.getElementById('d5Video');
    if (d5Video) {
        d5Video.muted = true;
        d5Video.defaultMuted = true;
        const playD5 = () => {
            if (d5Video.paused) {
                d5Video.muted = true;
                d5Video.play().catch(() => {});
            }
        };

        if ('IntersectionObserver' in window) {
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        playD5();
                    } else {
                        if (!d5Video.paused) {
                            d5Video.pause();
                        }
                    }
                });
            }, { threshold: 0.15 });
            videoObserver.observe(d5Video);
        } else {
            playD5();
        }

        // Additional user touch/scroll unlock fallback for strict mobile browser policies
        ['touchstart', 'scroll'].forEach(evt => {
            window.addEventListener(evt, () => {
                if (d5Video.getBoundingClientRect().top < window.innerHeight && d5Video.getBoundingClientRect().bottom > 0) {
                    playD5();
                }
            }, { passive: true, once: true });
        });
    }

    // =========================================================
    // 6. META PIXEL EVENT TRACKING (Strict Real Tracking)
    // =========================================================
    function sendMetaPixelEvent(eventName, params = {}) {
        if (typeof fbq === 'function') {
            try {
                fbq('track', eventName, params);
                console.log(`[Meta Pixel] Tracked: ${eventName}`, params);
            } catch (err) {
                console.warn('[Meta Pixel] Error tracking event:', err);
            }
        }
    }

    // Track InitiateCheckout on payment buttons
    document.querySelectorAll('[data-track-checkout]').forEach(btn => {
        btn.addEventListener('click', function () {
            const provider = this.getAttribute('data-track-checkout');
            if (provider === 'gumroad') {
                sendMetaPixelEvent('InitiateCheckout', {
                    content_name: 'Alen PBR Organizer Full Suite - Gumroad',
                    content_category: 'Software & 3D Assets',
                    currency: 'USD',
                    value: 17.00
                });
            } else if (provider === 'mercadopago') {
                sendMetaPixelEvent('InitiateCheckout', {
                    content_name: 'Alen PBR Organizer Full Suite - Mercado Pago',
                    content_category: 'Software & 3D Assets',
                    currency: 'MXN',
                    value: 297.00
                });
            } else if (provider === 'paypal') {
                sendMetaPixelEvent('InitiateCheckout', {
                    content_name: 'Alen PBR Organizer Full Suite - PayPal',
                    content_category: 'Software & 3D Assets',
                    currency: 'USD',
                    value: 17.00
                });
            }
        });
    });

    // Track WhatsApp support click
    document.querySelectorAll('[data-track-whatsapp]').forEach(btn => {
        btn.addEventListener('click', function () {
            sendMetaPixelEvent('Contact', {
                content_name: 'WhatsApp Customer Support',
                content_category: 'Lead / Support'
            });
        });
    });

    // Track ViewContent when pricing section is viewed
    const pricingElem = document.getElementById('pricing');
    if (pricingElem && 'IntersectionObserver' in window) {
        let pricingTracked = false;
        const pricingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !pricingTracked) {
                    pricingTracked = true;
                    sendMetaPixelEvent('ViewContent', {
                        content_name: 'Alen PBR Organizer Pricing Section',
                        content_category: 'Pricing Section',
                        currency: 'MXN',
                        value: 297.00
                    });
                }
            });
        }, { threshold: 0.25 });
        pricingObserver.observe(pricingElem);
    }

});
