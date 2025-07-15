// Intersection Observer API implementation

// Initialize Intersection Observer
function initIntersectionObserver() {
    console.log("Initializing Intersection Observer");
    
    // Set up lazy loading for images
    observeImages();
    
    // Set up section scroll animations
    observeSections();
    
    // Set up animation for elements appearing in viewport
    observeAppearElements();
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
                    
                    // Create a temporary image to test loading
                    const tempImg = new Image();
                    tempImg.onload = () => {
                        // Replace placeholder with actual image once loaded
                        img.src = src;
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                    };
                    
                    tempImg.onerror = () => {
                        // If image fails to load, keep placeholder
                        console.warn('Failed to load image:', src);
                        img.onerror = null; // Prevent error loop
                    };
                    
                    // Start loading
                    tempImg.src = src;
                    
                    // Stop observing this image
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '100px 0px', // Start loading before images come into view
        threshold: 0.1 // Trigger when at least 10% of the item is visible
    });
    
    // Find all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    console.log(`Found ${lazyImages.length} images to lazy load`);
    
    lazyImages.forEach(img => {
        // Ensure image has a placeholder
        if (!img.src) {
            img.src = 'images/placeholder.jpg';
        }
        
        // Start observing
        imageObserver.observe(img);
    });
}

// Fallback for browsers without Intersection Observer support
function loadAllImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    lazyImages.forEach(img => {
        const src = img.dataset.src;
        if (src) {
            // Create a temporary image to test loading
            const tempImg = new Image();
            tempImg.onload = () => {
                img.src = src;
                img.removeAttribute('data-src');
            };
            
            tempImg.onerror = () => {
                console.warn('Failed to load image:', src);
                // Keep placeholder
                if (!img.src) {
                    img.src = 'images/placeholder.jpg';
                }
            };
            
            // Start loading
            tempImg.src = src;
        } else if (!img.src) {
            img.src = 'images/placeholder.jpg';
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
                
                // Stop observing to prevent repeated animations
                sectionObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '-50px 0px', // Trigger when section is definitely in viewport
        threshold: 0.1 // Trigger when at least 10% of the section is visible
    });
    
    // Observe all section headers and feature cards
    const animatableElements = document.querySelectorAll('.section-header, .feature-card, .stats-card');
    
    animatableElements.forEach(element => {
        // Add animation-ready class
        element.classList.add('animation-ready');
        
        // Start observing
        sectionObserver.observe(element);
    });
}

// Observe elements to add appear animations
function observeAppearElements() {
    // Check if Intersection Observer is available
    if (!('IntersectionObserver' in window)) {
        return;
    }
    
    // Create CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .appear-element {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .appear-element.appear {
            opacity: 1;
            transform: translateY(0);
        }
        
        .appear-left {
            opacity: 0;
            transform: translateX(-20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .appear-left.appear {
            opacity: 1;
            transform: translateX(0);
        }
        
        .appear-right {
            opacity: 0;
            transform: translateX(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .appear-right.appear {
            opacity: 1;
            transform: translateX(0);
        }
    `;
    document.head.appendChild(style);
    
    // Create observer
    const appearObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add appear class when element comes into view
                entry.target.classList.add('appear');
                
                // Stop observing to prevent repeated animations
                appearObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });
    
    // Add classes to elements that should appear with animation
    document.querySelectorAll('.recommendation-card').forEach((el, i) => {
        el.classList.add('appear-element');
        // Stagger the animation
        el.style.transitionDelay = `${i * 0.1}s`;
        appearObserver.observe(el);
    });
    
    document.querySelectorAll('.poi-item').forEach((el, i) => {
        el.classList.add('appear-element');
        // Stagger the animation
        el.style.transitionDelay = `${i * 0.1}s`;
        appearObserver.observe(el);
    });
    
    document.querySelectorAll('.saved-place-card').forEach((el, i) => {
        el.classList.add('appear-element');
        // Stagger the animation
        el.style.transitionDelay = `${i * 0.1}s`;
        appearObserver.observe(el);
    });
    
    // Add left/right appear animations for specific elements
    document.querySelectorAll('.feature-card:nth-child(odd)').forEach((el) => {
        el.classList.add('appear-left');
        appearObserver.observe(el);
    });
    
    document.querySelectorAll('.feature-card:nth-child(even)').forEach((el) => {
        el.classList.add('appear-right');
        appearObserver.observe(el);
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