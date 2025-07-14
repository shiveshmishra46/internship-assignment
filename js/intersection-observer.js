// Intersection Observer API implementation

// Initialize Intersection Observer
function initIntersectionObserver() {
    console.log("Initializing Intersection Observer");
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
                    console.log("Loading image:", src);
                    // Replace placeholder with actual image
                    img.src = src;
                    
                    // Add load event to handle errors
                    img.onload = () => {
                        // Remove data-src to prevent reloading
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                    };
                    
                    img.onerror = () => {
                        // If image fails to load, keep placeholder
                        console.warn('Failed to load image:', src);
                        img.src = 'images/placeholder.jpg';
                    };
                    
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
    console.log(`Found ${lazyImages.length} images to lazy load`);
    
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

// Fallback for browsers without Intersection Observer support
function loadAllImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    lazyImages.forEach(img => {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            
            img.onerror = () => {
                img.src = 'images/placeholder.jpg';
            };
        }
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

// Export functions to be used by other scripts
window.observerFunctions = {
    observeImages,
    observeSections,
    observeRecommendationCards
};