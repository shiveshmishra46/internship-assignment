/**
 * FIXED Image Handler - One-time loading with no reload issues
 * Ensures images fit properly in containers and load only once
 */
document.addEventListener('DOMContentLoaded', function() {
    // Cached image repository - prevents multiple loading
    const loadedImages = new Map();
    
    // High-quality image sources from reliable CDNs
    const IMAGE_CATEGORIES = {
        'restaurant': [
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
            'https://images.unsplash.com/photo-1552566626-52f8b828add9',
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'
        ],
        'hotel': [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd',
            'https://images.unsplash.com/photo-1445019980597-93fa8acb246c'
        ],
        'attraction': [
            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
            'https://images.unsplash.com/photo-1558383817-db0ab7228271',
            'https://images.unsplash.com/photo-1568849676085-51415703900f'
        ],
        'default': [
            'https://images.unsplash.com/photo-1500835556837-99ac94a94552',
            'https://images.unsplash.com/photo-1530521954074-e64f6810b32d',
            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1'
        ]
    };
    
    // Get optimized image URL based on size
    function getOptimizedUrl(baseUrl, width, height) {
        // Unsplash format for optimized images
        if (baseUrl.includes('unsplash.com')) {
            return `${baseUrl}?q=80&w=${width}&h=${height}&fit=crop&auto=format`;
        }
        return baseUrl;
    }
    
    // Get a predetermined image for a category (no randomness to prevent reload)
    function getImageForCategory(category, index = 0, width = 400, height = 300) {
        const categoryImages = IMAGE_CATEGORIES[category.toLowerCase()] || IMAGE_CATEGORIES.default;
        // Use modulo to stay within array bounds
        const imageIndex = index % categoryImages.length;
        const baseUrl = categoryImages[imageIndex];
        
        // Create a cache key
        const cacheKey = `${baseUrl}_${width}x${height}`;
        
        // Check if we already loaded this image
        if (!loadedImages.has(cacheKey)) {
            loadedImages.set(cacheKey, getOptimizedUrl(baseUrl, width, height));
        }
        
        return loadedImages.get(cacheKey);
    }
    
    // Determine image category from element context
    function getImageCategory(element) {
        const altText = element.alt ? element.alt.toLowerCase() : '';
        const cardElement = element.closest('.recommendation-card, .saved-place-card, .poi-item');
        const dataCategory = element.dataset.category || (cardElement && cardElement.dataset.category);
        
        if (altText.includes('restaurant') || dataCategory === 'restaurant' || 
            (cardElement && cardElement.classList.contains('restaurant'))) {
            return 'restaurant';
        } else if (altText.includes('hotel') || dataCategory === 'hotel' || 
                 (cardElement && cardElement.classList.contains('hotel'))) {
            return 'hotel';
        } else if (altText.includes('attraction') || dataCategory === 'attraction' || 
                  (cardElement && cardElement.classList.contains('attraction'))) {
            return 'attraction';
        }
        
        return 'default';
    }
    
    // Get a unique index based on element position in DOM
    function getElementIndex(element) {
        // Get parent and find position among siblings
        const parent = element.parentNode;
        if (!parent) return 0;
        
        const siblings = Array.from(parent.children);
        return siblings.indexOf(element);
    }
    
    // Replace a single placeholder image - once only
    function replacePlaceholderImage(img) {
        // Skip if already processed
        if (img.hasAttribute('data-replaced')) return;
        
        // Mark as processed immediately to prevent double-loading
        img.setAttribute('data-replaced', 'true');
        
        // Get dimensions
        const width = Math.max(img.width || img.clientWidth || 400, 400);
        const height = Math.max(img.height || img.clientHeight || 300, 300);
        
        // Determine category and get a consistent image
        const category = getImageCategory(img);
        const elementIndex = getElementIndex(img);
        
        // Set image with preloading
        const newSrc = getImageForCategory(category, elementIndex, width, height);
        
        // Create a hidden image loader
        const imageLoader = new Image();
        imageLoader.onload = function() {
            // Once loaded, swap the source
            img.src = newSrc;
            img.style.opacity = '1';
            
            // Remove loading state
            const imgContainer = img.closest('.recommendation-img, .saved-place-img, .detail-img');
            if (imgContainer) {
                imgContainer.classList.remove('image-loading');
            }
        };
        
        // Add loading state
        const imgContainer = img.closest('.recommendation-img, .saved-place-img, .detail-img');
        if (imgContainer) {
            imgContainer.classList.add('image-loading');
        }
        
        // Start loading
        imageLoader.src = newSrc;
    }
    
    // Process all placeholder images (once only)
    function processAllImages() {
        document.querySelectorAll('img[src*="placeholder"]').forEach(img => {
            if (!img.hasAttribute('data-replaced')) {
                replacePlaceholderImage(img);
            }
        });
    }
    
    // Set up MutationObserver to watch for new images
    function setupImageObserver() {
        const observer = new MutationObserver(mutations => {
            let shouldProcess = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        // Check if added node is an image or contains images
                        if (node.nodeType === 1) { // Element node
                            if (node.tagName === 'IMG' && node.src.includes('placeholder')) {
                                shouldProcess = true;
                            } else if (node.querySelectorAll) {
                                const images = node.querySelectorAll('img[src*="placeholder"]');
                                if (images.length > 0) shouldProcess = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldProcess) {
                processAllImages();
            }
        });
        
        // Watch for changes in the entire document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Set up templates for consistent image handling
    function prepareTemplates() {
        document.querySelectorAll('template').forEach(template => {
            const images = template.content.querySelectorAll('img[src*="placeholder"]');
            images.forEach(img => {
                // Pre-configure data attributes for when template gets cloned
                img.setAttribute('data-category', getImageCategory(img));
            });
        });
    }
    
    // Initialize all functionality
    function init() {
        prepareTemplates();
        setupImageObserver();
        
        // Initial image processing (with slight delay to ensure DOM is ready)
        setTimeout(processAllImages, 100);
        
        // Make function available globally
        window.replaceAllPlaceholders = processAllImages;
    }
    
    // Start initialization
    init();
});