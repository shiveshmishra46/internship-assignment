/**
 * Intersection Observer Utilities
 * Handles lazy loading and visibility detection
 * Last updated: 2025-07-16
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize lazy loading for images
    setupImageLazyLoading();
    
    // Initialize animation on scroll
    setupScrollAnimations();
});

/**
 * Set up lazy loading for images
 * Only loads images when they come into the viewport
 */
function setupImageLazyLoading() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers - load all images immediately
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
        return;
    }
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // If the image has a data-src attribute, use it
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                
                // Stop observing this image
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '200px 0px', // Start loading 200px before the image enters the viewport
        threshold: 0.01
    });
    
    // Observe all images with loading="lazy"
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

/**
 * Set up animations that trigger when elements scroll into view
 */
function setupScrollAnimations() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers - show all elements immediately
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.add('animated');
        });
        return;
    }
    
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Add the animation class
                element.classList.add('animated');
                
                // If the animation should only happen once
                if (element.dataset.animateOnce !== 'false') {
                    observer.unobserve(element);
                }
            } else {
                // If the element has left the viewport and animation should repeat
                const element = entry.target;
                if (element.dataset.animateOnce === 'false') {
                    element.classList.remove('animated');
                }
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });
    
    // Observe all elements with the animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        animationObserver.observe(el);
    });
}

/**
 * Create an intersection observer to monitor when elements become visible
 * 
 * @param {Function} callback - Function to call when elements intersect
 * @param {Object} options - IntersectionObserver options
 * @returns {IntersectionObserver} - The created observer
 */
function createVisibilityObserver(callback, options = {}) {
    const defaultOptions = {
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return new IntersectionObserver(callback, mergedOptions);
}

// Export functions for other modules
if (typeof window !== 'undefined') {
    window.setupImageLazyLoading = setupImageLazyLoading;
    window.setupScrollAnimations = setupScrollAnimations;
    window.createVisibilityObserver = createVisibilityObserver;
}