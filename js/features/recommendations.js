/**
 * Recommendations Feature
 * Handles recommendation loading and filtering
 * Last updated: 2025-07-16
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load initial recommendations
    loadRecommendations();
    
    // Set up filter buttons
    setupFilters();
});

// Load recommendations
function loadRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations-container');
    if (!recommendationsContainer) return;
    
    // Show loading state
    recommendationsContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Loading recommendations...</p>
        </div>
    `;
    
    // Use mock data from recommendation-data.js
    if (window.mockRecommendations && window.mockRecommendations.length > 0) {
        setTimeout(() => {
            // Clear loading indicator
            recommendationsContainer.innerHTML = '';
            
            // Render recommendations
            renderRecommendations(window.mockRecommendations);
        }, 1000); // Simulate loading
    } else {
        recommendationsContainer.innerHTML = `
            <div class="no-data">
                <i class="fas fa-map"></i>
                <p>No recommendations available. Try changing your location.</p>
                <button class="btn primary" onclick="window.appFunctions.navigateToSection('map')">
                    <i class="fas fa-map-marker-alt"></i> Go to Map
                </button>
            </div>
        `;
    }
}

// Render recommendations
function renderRecommendations(recommendations) {
    const recommendationsContainer = document.getElementById('recommendations-container');
    if (!recommendationsContainer) return;
    
    // Setup intersection observer for lazy loading
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                animateCard(card);
                observer.unobserve(card);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });
    
    // Create cards for each recommendation
    recommendations.forEach((place, index) => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.setAttribute('data-category', place.category || 'other');
        
        // Create card content
        card.innerHTML = `
            <div class="card-image">
                <img src="${place.imageUrl || 'assets/images/placeholder.jpg'}" 
                     alt="${place.name}" loading="lazy">
                <div class="card-badge">${place.category || 'Place'}</div>
            </div>
            <div class="card-content">
                <h3>${place.name}</h3>
                <p>${place.description ? place.description.substring(0, 80) + '...' : 'No description available'}</p>
                <div class="card-meta">
                    <span class="distance">${place.distance ? formatDistance(place.distance) : ''}</span>
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>${place.rating || '4.0'}</span>
                    </div>
                </div>
                <button class="btn secondary view-details-btn" data-place-id="${place.id}">
                    <i class="fas fa-info-circle"></i> Details
                </button>
            </div>
        `;
        
        // Start with opacity 0
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        // Add to container
        recommendationsContainer.appendChild(card);
        
        // Observe card for lazy loading
        observer.observe(card);
        
        // Add click listener for details button
        const viewDetailsBtn = card.querySelector('.view-details-btn');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => {
                if (window.showPlaceDetails) {
                    window.showPlaceDetails(place);
                }
            });
        }
    });
}

// Format distance for display
function formatDistance(distance) {
    if (typeof distance !== 'number') return '';
    
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
    } else {
        return `${distance.toFixed(1)}km`;
    }
}

// Animate card entry
function animateCard(card) {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });
}

// Set up filter buttons
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (!filterButtons) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Apply filter
            const filter = this.dataset.filter;
            filterRecommendations(filter);
        });
    });
}

// Filter recommendations
function filterRecommendations(filter) {
    // Use Background Tasks API to process filtering without blocking UI
    scheduleBackgroundTask(() => {
        // Get all recommendation cards
        const recommendationCards = document.querySelectorAll('.recommendation-card');
        
        if (filter === 'all') {
            // Show all cards
            recommendationCards.forEach(card => {
                card.style.display = 'block';
                
                // Add fade-in animation
                card.style.opacity = '0';
                setTimeout(() => {
                    card.style.opacity = '1';
                }, 10);
            });
        } else {
            // Filter cards
            recommendationCards.forEach(card => {
                const category = card.dataset.category;
                if (category === filter) {
                    card.style.display = 'block';
                    
                    // Add fade-in animation
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.opacity = '1';
                    }, 10);
                } else {
                    card.style.display = 'none';
                }
            });
        }
    });
}

// Export functions for other modules
if (typeof window !== 'undefined') {
    window.loadRecommendations = loadRecommendations;
    window.filterRecommendations = filterRecommendations;
}