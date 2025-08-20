// Application state
const app = {
  currentPage: 'home',
  testimonialIndex: 0,
  isModalOpen: false,
  testimonialAutoplay: null
};

// DOM elements
const elements = {
  navLinks: document.querySelectorAll('.nav__link'),
  navToggle: document.getElementById('nav-toggle'),
  navMenu: document.getElementById('nav-menu'),
  pages: document.querySelectorAll('.page'),
  quickQuoteForm: document.getElementById('quick-quote-form'),
  contactForm: document.getElementById('contact-form'),
  testimonialSlider: document.getElementById('testimonial-slider'),
  testimonials: document.querySelectorAll('.testimonial'),
  testimonialPrev: document.querySelector('.testimonial-prev'),
  testimonialNext: document.querySelector('.testimonial-next'),
  faqItems: document.querySelectorAll('.faq-item'),
  modal: document.getElementById('success-modal'),
  modalCloses: document.querySelectorAll('.modal-close'),
  serviceCtas: document.querySelectorAll('.service-cta'),
  footerLinks: document.querySelectorAll('.footer-links a[href^="#"]')
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializeForms();
  initializeTestimonials();
  initializeFAQ();
  initializeModal();
  initializeServiceCtas();
  initializeSmoothScroll();
  initializeStickyHeader();
  initializeAnimations();
  initializeAccessibility();
  enhanceFormUX();
  
  // Set initial page based on hash
  const hash = window.location.hash.substring(1);
  if (hash && ['home', 'services', 'about', 'contact'].includes(hash)) {
    showPage(hash);
  } else {
    showPage('home');
  }
});

// Navigation functionality
function initializeNavigation() {
  // Desktop navigation
  elements.navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetPage = this.getAttribute('href').substring(1);
      showPage(targetPage);
      
      // Close mobile menu if open
      elements.navMenu.classList.remove('active');
    });
  });

  // Mobile menu toggle
  if (elements.navToggle) {
    elements.navToggle.addEventListener('click', function() {
      elements.navMenu.classList.toggle('active');
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!elements.navMenu.contains(e.target) && !elements.navToggle.contains(e.target)) {
      elements.navMenu.classList.remove('active');
    }
  });

  // Footer navigation
  elements.footerLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetPage = this.getAttribute('href').substring(1);
      showPage(targetPage);
    });
  });
}

// Page switching functionality
function showPage(pageId) {
  // Hide all pages
  elements.pages.forEach(page => {
    page.classList.remove('active');
  });

  // Show target page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    app.currentPage = pageId;
    
    // Update URL hash
    window.history.pushState({}, '', `#${pageId}`);
    
    // Update active navigation link
    updateActiveNavLink(pageId);
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Add fade in animation
    targetPage.classList.add('fade-in-up');
    setTimeout(() => {
      targetPage.classList.remove('fade-in-up');
    }, 600);
    
    // Restart testimonial autoplay if on home page
    if (pageId === 'home') {
      startTestimonialAutoplay();
    } else {
      stopTestimonialAutoplay();
    }
  }
}

// Update active navigation link
function updateActiveNavLink(pageId) {
  elements.navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${pageId}`) {
      link.classList.add('active');
    }
  });
}

// Form handling
function initializeForms() {
  // Quick quote form
  if (elements.quickQuoteForm) {
    elements.quickQuoteForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleFormSubmission(this, 'quick-quote');
    });
  }

  // Contact form
  if (elements.contactForm) {
    elements.contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleFormSubmission(this, 'contact');
    });
  }
}

// Handle form submission
function handleFormSubmission(form, formType) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  // Validate form
  if (!validateForm(form)) {
    return;
  }
  
  // Show loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  
  // Collect form data
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  // Simulate API call
  setTimeout(() => {
    // Reset form
    form.reset();
    removeValidationClasses(form);
    
    // Reset button
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    // Show success modal
    showModal();
    
    // Track form submission (for analytics)
    trackEvent('form_submit', {
      form_type: formType,
      ...data
    });
    
  }, 2000); // Simulate 2 second API call
}

// Form validation
function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      showFieldError(field, 'This field is required');
      isValid = false;
    } else {
      showFieldSuccess(field);
      
      // Additional validation based on field type
      if (field.type === 'email' && !isValidEmail(field.value)) {
        showFieldError(field, 'Please enter a valid email address');
        isValid = false;
      } else if (field.type === 'tel' && !isValidPhone(field.value)) {
        showFieldError(field, 'Please enter a valid phone number');
        isValid = false;
      }
    }
  });
  
  // Validate consent checkbox if present
  const consentCheckbox = form.querySelector('input[name="consent"]');
  if (consentCheckbox && !consentCheckbox.checked) {
    showFieldError(consentCheckbox.closest('.form-group'), 'Please agree to be contacted');
    isValid = false;
  }
  
  return isValid;
}

// Show field error
function showFieldError(field, message) {
  field.classList.remove('success');
  field.classList.add('error');
  
  // Remove existing error message
  const existingError = field.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Add new error message
  const errorElement = document.createElement('span');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  field.parentNode.appendChild(errorElement);
}

// Show field success
function showFieldSuccess(field) {
  field.classList.remove('error');
  field.classList.add('success');
  
  // Remove error message
  const errorMessage = field.parentNode.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

// Remove validation classes
function removeValidationClasses(form) {
  const fields = form.querySelectorAll('.form-control');
  fields.forEach(field => {
    field.classList.remove('error', 'success');
  });
  
  const errorMessages = form.querySelectorAll('.error-message');
  errorMessages.forEach(msg => msg.remove());
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (basic UK format)
function isValidPhone(phone) {
  const phoneRegex = /^(\+44|0)[0-9\s-]{9,13}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Testimonial slider - FIXED VERSION
function initializeTestimonials() {
  if (!elements.testimonials.length) return;
  
  // Ensure first testimonial is active
  elements.testimonials.forEach((testimonial, index) => {
    testimonial.classList.toggle('active', index === 0);
  });
  
  app.testimonialIndex = 0;
  
  // Navigation buttons
  if (elements.testimonialPrev) {
    elements.testimonialPrev.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showPreviousTestimonial();
      console.log('Previous testimonial clicked, current index:', app.testimonialIndex);
    });
  }
  
  if (elements.testimonialNext) {
    elements.testimonialNext.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showNextTestimonial();
      console.log('Next testimonial clicked, current index:', app.testimonialIndex);
    });
  }
  
  // Start autoplay
  startTestimonialAutoplay();
}

function showNextTestimonial() {
  if (!elements.testimonials.length) return;
  
  // Hide current testimonial
  elements.testimonials[app.testimonialIndex].classList.remove('active');
  
  // Move to next testimonial
  app.testimonialIndex = (app.testimonialIndex + 1) % elements.testimonials.length;
  
  // Show new testimonial
  elements.testimonials[app.testimonialIndex].classList.add('active');
  
  console.log('Showing testimonial index:', app.testimonialIndex);
}

function showPreviousTestimonial() {
  if (!elements.testimonials.length) return;
  
  // Hide current testimonial
  elements.testimonials[app.testimonialIndex].classList.remove('active');
  
  // Move to previous testimonial
  app.testimonialIndex = app.testimonialIndex === 0 ? elements.testimonials.length - 1 : app.testimonialIndex - 1;
  
  // Show new testimonial
  elements.testimonials[app.testimonialIndex].classList.add('active');
  
  console.log('Showing testimonial index:', app.testimonialIndex);
}

function startTestimonialAutoplay() {
  stopTestimonialAutoplay(); // Clear any existing interval
  
  app.testimonialAutoplay = setInterval(() => {
    if (app.currentPage === 'home') {
      showNextTestimonial();
    }
  }, 5000);
}

function stopTestimonialAutoplay() {
  if (app.testimonialAutoplay) {
    clearInterval(app.testimonialAutoplay);
    app.testimonialAutoplay = null;
  }
}

// FAQ functionality
function initializeFAQ() {
  elements.faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        toggleFaqItem(item);
      });
    }
  });
}

function toggleFaqItem(item) {
  const isActive = item.classList.contains('active');
  
  // Close all FAQ items
  elements.faqItems.forEach(faqItem => {
    faqItem.classList.remove('active');
  });
  
  // Open clicked item if it wasn't already active
  if (!isActive) {
    item.classList.add('active');
  }
}

// Modal functionality
function initializeModal() {
  elements.modalCloses.forEach(closeBtn => {
    closeBtn.addEventListener('click', hideModal);
  });
  
  // Close modal when clicking outside
  if (elements.modal) {
    elements.modal.addEventListener('click', (e) => {
      if (e.target === elements.modal) {
        hideModal();
      }
    });
  }
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && app.isModalOpen) {
      hideModal();
    }
  });
}

function showModal() {
  if (elements.modal) {
    elements.modal.classList.remove('hidden');
    app.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }
}

function hideModal() {
  if (elements.modal) {
    elements.modal.classList.add('hidden');
    app.isModalOpen = false;
    document.body.style.overflow = '';
  }
}

// Service CTA buttons
function initializeServiceCtas() {
  elements.serviceCtas.forEach(btn => {
    btn.addEventListener('click', () => {
      showPage('contact');
      
      // Scroll to form after page transition
      setTimeout(() => {
        const contactForm = document.querySelector('.contact-form-section');
        if (contactForm) {
          contactForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
      
      trackEvent('service_cta_click', {
        service: btn.closest('.service-module')?.querySelector('h2')?.textContent || 'unknown'
      });
    });
  });
}

// Smooth scrolling for anchor links
function initializeSmoothScroll() {
  // Handle CTA buttons that should go to contact
  const ctaButtons = document.querySelectorAll('a[href="#contact"]');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showPage('contact');
    });
  });
  
  // Handle other internal links
  const internalLinks = document.querySelectorAll('a[href^="#"]:not([href="#contact"]):not([href="#services"]):not([href="#about"]):not([href="#home"])');
  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Sticky header
function initializeStickyHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  
  let lastScrollY = window.scrollY;
  
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Hide header on scroll down, show on scroll up
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }
    
    lastScrollY = currentScrollY;
  });
}

// Intersection Observer for animations
function initializeAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
      }
    });
  }, observerOptions);
  
  // Observe elements that should animate on scroll
  const animateElements = document.querySelectorAll('.feature-card, .service-card, .step, .testimonial, .safety-item');
  animateElements.forEach(el => observer.observe(el));
}

// Analytics tracking (placeholder)
function trackEvent(eventName, eventData = {}) {
  // This would integrate with actual analytics service
  console.log('Analytics Event:', eventName, eventData);
  
  // Example Google Analytics tracking
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, eventData);
  }
  
  // Example Facebook Pixel tracking
  if (typeof fbq !== 'undefined') {
    fbq('track', eventName, eventData);
  }
}

// Phone number click tracking
document.addEventListener('DOMContentLoaded', function() {
  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  phoneLinks.forEach(link => {
    link.addEventListener('click', () => {
      trackEvent('phone_click', {
        phone_number: link.getAttribute('href')
      });
    });
  });
  
  const whatsappLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]');
  whatsappLinks.forEach(link => {
    link.addEventListener('click', () => {
      trackEvent('whatsapp_click', {
        link_url: link.getAttribute('href')
      });
    });
  });
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(e) {
  const hash = window.location.hash.substring(1);
  if (hash && ['home', 'services', 'about', 'contact'].includes(hash)) {
    showPage(hash);
  } else {
    showPage('home');
  }
});

// Utility functions
function debounce(func, wait) {
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

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Performance optimization
const debouncedResize = debounce(() => {
  // Handle resize events
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}, 250);

window.addEventListener('resize', debouncedResize);

// Initial call
debouncedResize();

// Lazy loading for images (if needed)
function initializeLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    const lazyImages = document.querySelectorAll('img.lazy');
    lazyImages.forEach(img => imageObserver.observe(img));
  }
}

// Error handling
window.addEventListener('error', function(e) {
  console.error('Application error:', e.error);
  // Could send to error reporting service
});

// Service Worker registration (for PWA features)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    // Uncomment if you have a service worker
    // navigator.serviceWorker.register('/sw.js')
    //   .then(registration => console.log('SW registered'))
    //   .catch(error => console.log('SW registration failed'));
  });
}

// Accessibility improvements
function initializeAccessibility() {
  // Skip link functionality
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(skipLink.getAttribute('href'));
      if (target) {
        target.focus();
        target.scrollIntoView();
      }
    });
  }
  
  // Keyboard navigation for custom components
  document.addEventListener('keydown', (e) => {
    // Handle Enter/Space on buttons
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('faq-question')) {
      e.preventDefault();
      e.target.click();
    }
    
    // Handle arrow keys for testimonial navigation
    if (e.target.closest('.testimonial-nav')) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showPreviousTestimonial();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showNextTestimonial();
      }
    }
  });
}

// Form enhancement
function enhanceFormUX() {
  // Auto-format phone numbers
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.startsWith('44')) {
        value = '+44 ' + value.substring(2);
      } else if (value.startsWith('0')) {
        value = '+44 ' + value.substring(1);
      }
      
      // Format as +44 XXXX XXX XXX
      if (value.startsWith('+44')) {
        const numbers = value.substring(3);
        if (numbers.length > 4) {
          value = '+44 ' + numbers.substring(0, 4) + ' ' + numbers.substring(4, 7) + ' ' + numbers.substring(7, 10);
        }
      }
      
      e.target.value = value.trim();
    });
  });
  
  // Real-time validation
  const inputs = document.querySelectorAll('.form-control');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value.trim()) {
        if (input.type === 'email' && !isValidEmail(input.value)) {
          showFieldError(input, 'Please enter a valid email address');
        } else if (input.type === 'tel' && !isValidPhone(input.value)) {
          showFieldError(input, 'Please enter a valid phone number');
        } else {
          showFieldSuccess(input);
        }
      }
    });
    
    input.addEventListener('input', () => {
      if (input.classList.contains('error') && input.value.trim()) {
        input.classList.remove('error');
        const errorMsg = input.parentNode.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      }
    });
  });
}

// Export for testing or external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { app, showPage, validateForm, trackEvent };
}