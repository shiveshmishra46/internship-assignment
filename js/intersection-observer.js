// Intersection Observer API implementation

// Initialize Intersection Observer
function initIntersectionObserver() {
    // Set up lazy loading for images
    observeImages();
    
    // Set up section scroll animations
    observeSections();
}

// Lazy load images with Intersection Observer
function observeImages() {
    // Check if Intersection Observer is available
    if (!('IntersectionObserver' in window)) {
        // Fallback for browsers that don't support Intersection Observer
        loadAllImages();
        return;
    }
    
    // Create observer for images
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                
                if (src) {
                    // Replace placeholder with actual image
                    img.src = src;
                    
                    // Remove data-src to prevent reloading
                    img.removeAttribute('data-src');
                    
                    // Stop observing this image
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px 0px', // Start loading slightly before images come into view
        threshold: 0.1 // Trigger when at least 10% of the item is visible
    });
    
    // Find all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

// Fallback for browsers without Intersection Observer support
function loadAllImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    lazyImages.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
    });
}

// Add scroll animations to sections using Intersection Observer
function observeSections() {
    // Check if Intersection Observer is available
    if (!('IntersectionObserver' in window)) {
        return;
    }
    
    // Create observer for sections
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation class when section comes into view
                entry.target.classList.add('animate-in');
            } else {
                // Optionally remove animation class when section leaves viewport
                // entry.target.classList.remove('animate-in');
            }
        });
    }, {
        rootMargin: '-50px 0px', // Trigger when section is definitely in viewport
        threshold: 0.1 // Trigger when at least 10% of the section is visible
    });
    
    // Observe all section headers and feature cards
    const animatableElements = document.querySelectorAll('.section-header, .feature-card, .recommendation-card, .saved-place-card');
    
    animatableElements.forEach(element => {
        // Add animation-ready class
        element.classList.add('animation-ready');
        
        // Start observing
        sectionObserver.observe(element);
    });
}

// Observe recommendation cards when they're loaded
function observeRecommendationCards() {
    // Check if Intersection Observer is available
    if (!('IntersectionObserver' in window)) {
        return;
    }
    
    // Create observer for cards
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation class when card comes into view
                entry.target.classList.add('card-visible');
                
                // Stop observing once animation is triggered
                cardObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.15
    });
    
    // Observe all recommendation cards
    const cards = document.querySelectorAll('.recommendation-card');
    cards.forEach(card => {
        cardObserver.observe(card);
    });
}

// Add additional styling for animation-ready elements
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animation-ready {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .recommendation-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .recommendation-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-lg);
        }
    `;
    document.head.appendChild(style);
});

// Export functions to be used by other scripts
window.observerFunctions = {
    observeImages,
    observeSections,
    observeRecommendationCards
};