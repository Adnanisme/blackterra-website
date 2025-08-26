/*===== MAIN JAVASCRIPT =====*/

/*===== DOM ELEMENTS =====*/
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelectorAll('.nav__link');
const backToTop = document.getElementById('back-to-top');
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');
const sections = document.querySelectorAll('section[id]');
const header = document.getElementById('header');

/*===== MOBILE MENU TOGGLE =====*/
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show');
        const icon = navToggle.querySelector('i');
        
        if (navMenu.classList.contains('show')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

/*===== CLOSE MOBILE MENU WHEN CLICKING NAV LINKS =====*/
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('show');
        const icon = navToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

/*===== SMOOTH SCROLLING FOR NAVIGATION LINKS =====*/
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

/*===== SMOOTH SCROLLING FOR ALL ANCHOR LINKS =====*/
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

/*===== ACTIVE SECTION HIGHLIGHTING =====*/
function highlightActiveSection() {
    const scrollY = window.pageYOffset;
    const headerHeight = header.offsetHeight;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionId = section.getAttribute('id');
        const correspondingNavLink = document.querySelector(`.nav__link[href*="${sectionId}"]`);
        
        if (correspondingNavLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                correspondingNavLink.classList.add('active-link');
            } else {
                correspondingNavLink.classList.remove('active-link');
            }
        }
    });
}

/*===== HEADER BACKGROUND ON SCROLL =====*/
function changeHeaderBackground() {
    if (window.scrollY >= 50) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 25px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
}

/*===== BACK TO TOP BUTTON =====*/
function toggleBackToTop() {
    if (window.scrollY >= 500) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
}

if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/*===== SCROLL EVENT LISTENERS =====*/
window.addEventListener('scroll', () => {
    highlightActiveSection();
    changeHeaderBackground();
    toggleBackToTop();
});


/*===== CONTACT FORM HANDLING =====*/
if (contactForm) {
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const formObject = Object.fromEntries(formData);
        
        // Basic validation
        const requiredFields = ['fullName', 'email', 'phone', 'message'];
        const emptyFields = requiredFields.filter(field => !formObject[field] || formObject[field].trim() === '');
        
        if (emptyFields.length > 0) {
            showFormMessage('Please fill in all required fields correctly.', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formObject.email)) {
            showFormMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        // Phone validation (basic)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(formObject.phone)) {
            showFormMessage('Please enter a valid phone number.', 'error');
            return;
        }
        
        // Set reply-to email
        document.getElementById('replyto').value = formObject.email;
        
        // Update form data
        const updatedFormData = new FormData(contactForm);
        
        // Submit to Formspree
        submitToFormspree(updatedFormData);
    });
}

/*===== FORMSPREE SUBMISSION =====*/
async function submitToFormspree(formData) {
    const submitButton = contactForm.querySelector('.form__submit');
    const originalText = submitButton.textContent;
    
    try {
        // Show loading state
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Submit to Formspree
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // Success
            showFormMessage("Thank you for your message! We'll get back to you within 24-48 hours.", 'success');
            contactForm.reset();
            
            // Track successful submission
            trackEvent('contact_form_success', {
                timestamp: new Date().toISOString()
            });
        } else {
            // Formspree error
            const data = await response.json();
            if (data.errors) {
                showFormMessage(data.errors.map(error => error.message).join(', '), 'error');
            } else {
                showFormMessage('Sorry, there was a problem sending your message. Please try again.', 'error');
            }
        }
    } catch (error) {
        // Network or other error
        console.error('Form submission error:', error);
        showFormMessage('Sorry, there was a problem sending your message. Please check your internet connection and try again.', 'error');
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

/*===== SHOW FORM MESSAGE =====*/
function showFormMessage(message, type) {
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = `form__message ${type}`;
        formMessage.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
}

/*===== SCROLL ANIMATIONS =====*/
function animateOnScroll() {
    const animatedElements = document.querySelectorAll('.values__item, .why-choose__item, .services__card, .mission-vision__item');
    
    animatedElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('fade-in-up');
        }
    });
}

/*===== INTERSECTION OBSERVER FOR ANIMATIONS =====*/
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll('.values__item, .why-choose__item, .services__card, .mission-vision__item');
    
    elementsToAnimate.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
});

/*===== HERO SCROLL INDICATOR =====*/
const heroScroll = document.querySelector('.hero__scroll');
if (heroScroll) {
    heroScroll.addEventListener('click', () => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            const headerHeight = header.offsetHeight;
            const targetPosition = aboutSection.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
}

/*===== FORM LABELS REMOVED - Using placeholders only =====*/

/*===== LAZY LOADING FOR IMAGES =====*/
function setupLazyLoading() {
    const images = document.querySelectorAll('img[src*="images/"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                img.onload = () => {
                    img.style.opacity = '1';
                };
                
                // If image is already loaded
                if (img.complete) {
                    img.style.opacity = '1';
                }
                
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

/*===== PERFORMANCE OPTIMIZATION =====*/
// Throttle scroll events for better performance
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll-dependent functions
const throttledScrollHandler = throttle(() => {
    highlightActiveSection();
    changeHeaderBackground();
    toggleBackToTop();
    animateOnScroll();
}, 16); // ~60fps

window.removeEventListener('scroll', () => {
    highlightActiveSection();
    changeHeaderBackground();
    toggleBackToTop();
});

window.addEventListener('scroll', throttledScrollHandler);

/*===== KEYBOARD NAVIGATION SUPPORT =====*/
document.addEventListener('keydown', (e) => {
    // ESC key closes mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        const icon = navToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

/*===== PRELOAD CRITICAL IMAGES =====*/
function preloadCriticalImages() {
    const criticalImages = [
        'images/logo-black-terra.png',
        'images/hero-energy-facility.png'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

/*===== INITIALIZATION =====*/
document.addEventListener('DOMContentLoaded', () => {
    setupLazyLoading();
    preloadCriticalImages();
    
    // Initial call to set active section
    highlightActiveSection();
    
    // Set initial header state
    changeHeaderBackground();
    
    // Console log for development
    console.log('Black Terra Energies website loaded successfully!');
    console.log('All interactive features initialized.');
});

/*===== ERROR HANDLING =====*/
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
});

/*===== SERVICE WORKER REGISTRATION (for future PWA features) =====*/
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker can be registered here for caching and offline functionality
        console.log('Service Worker support detected');
    });
}

/*===== ANALYTICS HELPERS =====*/
function trackEvent(eventName, eventData) {
    // This function can be used to track user interactions
    // Integration with Google Analytics or other analytics platforms
    console.log('Event tracked:', eventName, eventData);
}

// Track form submissions
if (contactForm) {
    contactForm.addEventListener('submit', () => {
        trackEvent('contact_form_submit', {
            page: 'home',
            timestamp: new Date().toISOString()
        });
    });
}

// Track CTA clicks
document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', (e) => {
        trackEvent('cta_click', {
            button_text: button.textContent.trim(),
            button_href: button.getAttribute('href'),
            timestamp: new Date().toISOString()
        });
    });
});
