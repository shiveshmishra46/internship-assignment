/**
 * Sample data generator for recommendations and saved places
 */
document.addEventListener('DOMContentLoaded', function() {
    // Toast notification system
    function setupToast() {
        window.appFunctions = window.appFunctions || {};
        
        window.appFunctions.showToast = function(message, type = 'info', duration = 3000) {
            const toastContainer = document.getElementById('toast-container');
            if (!toastContainer) return;
            
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            let iconClass = 'fa-info-circle';
            if (type === 'success') iconClass = 'fa-check-circle';
            if (type === 'error') iconClass = 'fa-exclamation-circle';
            if (type === 'warning') iconClass = 'fa-exclamation-triangle';
            
            toast.innerHTML = `
                <div class="toast-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="toast-message">${message}</div>
            `;
            
            toastContainer.appendChild(toast);
            
            // Show after brief delay for animation
            setTimeout(() => toast.classList.add('visible'), 10);
            
            // Remove after duration
            setTimeout(() => {
                toast.classList.remove('visible');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        };
    }

    // Sample data for demonstration
    const sampleRecommendations = [
        {
            name: "Skyline Restaurant",
            description: "Upscale dining with panoramic city views and contemporary cuisine featuring local ingredients.",
            rating: 4.8,
            distance: "1.2 km",
            type: "restaurant"
        },
        {
            name: "Grand Central Hotel",
            description: "Luxury accommodations in the heart of downtown with spa services and rooftop pool.",
            rating: 4.6,
            distance: "0.8 km",
            type: "hotel"
        },
        {
            name: "City Art Museum",
            description: "World-class exhibits featuring both classic and contemporary art in a stunning modern building.",
            rating: 4.7,
            distance: "2.3 km",
            type: "attraction"
        },
        {
            name: "Coastal Seafood",
            description: "Fresh local seafood served in a casual waterfront setting with stunning sunset views.",
            rating: 4.5,
            distance: "1.7 km",
            type: "restaurant"
        },
        {
            name: "Boutique Suites",
            description: "Charming boutique hotel with uniquely designed rooms and personalized service.",
            rating: 4.4,
            distance: "1.9 km",
            type: "hotel"
        },
        {
            name: "Historic Tower",
            description: "Iconic landmark offering guided tours and spectacular views from the observation deck.",
            rating: 4.9,
            distance: "3.1 km",
            type: "attraction"
        }
    ];
    
    // Load recommendations with delay to simulate API fetch
    function loadRecommendations() {
        const container = document.getElementById('recommendations-container');
        if (!container) return;
        
        // Clear loading indicator
        container.innerHTML = '';
        
        // Get recommendation template
        const template = document.getElementById('recommendation-template');
        if (!template) return;
        
        // Process each recommendation with slight delay for animation effect
        sampleRecommendations.forEach((place, index) => {
            setTimeout(() => {
                const card = document.importNode(template.content, true);
                
                // Set card data
                card.querySelector('.place-name').textContent = place.name;
                card.querySelector('.place-description').textContent = place.description;
                card.querySelector('.place-rating').innerHTML = `<i class="fas fa-star"></i> ${place.rating}`;
                card.querySelector('.place-distance').innerHTML = `<i class="fas fa-location-dot"></i> ${place.distance}`;
                
                // Set image category for our image handler
                const img = card.querySelector('img');
                if (img) {
                    img.setAttribute('data-category', place.type);
                    img.alt = `${place.name} - ${place.type}`;
                }
                
                // Add card type class for filtering
                const cardElement = card.querySelector('.recommendation-card');
                if (cardElement) {
                    cardElement.classList.add(place.type);
                    cardElement.setAttribute('data-category', place.type);
                }
                
                // Set badge text
                const badge = card.querySelector('.card-badge');
                if (badge) {
                    badge.textContent = place.type.charAt(0).toUpperCase() + place.type.slice(1);
                }
                
                // Add to container with fade-in effect
                const cardWrapper = document.createElement('div');
                cardWrapper.classList.add('recommendation-wrapper');
                cardWrapper.style.opacity = '0';
                cardWrapper.style.transform = 'translateY(20px)';
                cardWrapper.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                
                cardWrapper.appendChild(card);
                container.appendChild(cardWrapper);
                
                // Trigger fade-in animation
                setTimeout(() => {
                    cardWrapper.style.opacity = '1';
                    cardWrapper.style.transform = 'translateY(0)';
                }, 50);
                
            }, index * 200); // Stagger effect
        });
        
        // Make sure image handler runs after cards are created
        setTimeout(() => {
            if (window.replaceAllPlaceholders) {
                window.replaceAllPlaceholders();
            }
        }, sampleRecommendations.length * 200 + 100);
    }
    
    // Add filter functionality
    function setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const recommendationsContainer = document.getElementById('recommendations-container');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Get filter value
                const filter = button.getAttribute('data-filter');
                
                // Apply filter
                const cards = recommendationsContainer.querySelectorAll('.recommendation-wrapper');
                cards.forEach(card => {
                    const cardElement = card.querySelector('.recommendation-card');
                    if (!cardElement) return;
                    
                    if (filter === 'all' || cardElement.classList.contains(filter)) {
                        card.style.display = '';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(10px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 500);
                    }
                });
            });
        });
    }
    
    // Simulate saved places
    function setupSavedPlaces() {
        const container = document.getElementById('saved-places-container');
        if (!container) return;
        
        // Add a couple of saved places for demonstration
        const savedPlaces = [
            sampleRecommendations[0], // Restaurant
            sampleRecommendations[2]  // Attraction
        ];
        
        // Get template
        const template = document.getElementById('saved-place-template');
        if (!template) return;
        
        // Process saved places
        savedPlaces.forEach(place => {
            const card = document.importNode(template.content, true);
            
            // Set card data
            card.querySelector('.place-name').textContent = place.name;
            card.querySelector('.place-description').textContent = place.description;
            
            // Set image category
            const img = card.querySelector('img');
            if (img) {
                img.setAttribute('data-category', place.type);
                img.alt = `${place.name} - ${place.type}`;
            }
            
            // Add card type class
            const cardElement = card.querySelector('.saved-place-card');
            if (cardElement) {
                cardElement.classList.add(place.type);
                cardElement.setAttribute('data-category', place.type);
            }
            
            // Set badge text
            const badge = card.querySelector('.card-badge');
            if (badge) {
                badge.textContent = place.type.charAt(0).toUpperCase() + place.type.slice(1);
            }
            
            container.appendChild(card);
        });
        
        // Make sure image handler runs after cards are created
        setTimeout(() => {
            if (window.replaceAllPlaceholders) {
                window.replaceAllPlaceholders();
            }
        }, 100);
    }
    
    // Connect save buttons to saved places
    function setupEventListeners() {
        document.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('save-place')) {
                const card = e.target.closest('.recommendation-card');
                if (card) {
                    const name = card.querySelector('.place-name').textContent;
                    
                    // Show toast notification
                    if (window.appFunctions && window.appFunctions.showToast) {
                        window.appFunctions.showToast(`${name} saved to your places`, 'success');
                    }
                }
            }
        });
    }
    
    // Initialize
    function init() {
        setupToast();
        setTimeout(loadRecommendations, 1000); // Delay to simulate loading
        setupFilters();
        setupSavedPlaces();
        setupEventListeners();
    }
    
    init();
});