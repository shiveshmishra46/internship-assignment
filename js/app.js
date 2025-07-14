// Main application file

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Main initialization function
function initApp() {
    // Set up navigation
    setupNavigation();
    
    // Initialize all API-dependent features
    initGeolocation();
    initCanvasMap();
    initIntersectionObserver();
    initNetworkInfo();
    initBackgroundTasks();
    
    // Add event listeners
    document.getElementById('get-started-btn').addEventListener('click', () => {
        navigateToSection('map');
        showPermissionModal();
    });
    
    // Set up modal events
    document.getElementById('grant-permission').addEventListener('click', () => {
        requestGeolocation();
        closePermissionModal();
    });
    
    document.getElementById('deny-permission').addEventListener('click', () => {
        closePermissionModal();
        showNotification('Location access denied. Some features will be limited.');
    });
    
    // Set up filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            filterRecommendations(filter);
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

// Navigation between sections
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-items a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').substring(1);
            navigateToSection(targetId);
            
            // Update active link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function navigateToSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
}

// Modal functions
function showPermissionModal() {
    const modal = document.getElementById('permission-modal');
    modal.classList.add('active');
}

function closePermissionModal() {
    const modal = document.getElementById('permission-modal');
    modal.classList.remove('active');
}

// Notification function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Append to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
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
            });
        } else {
            // Filter cards
            recommendationCards.forEach(card => {
                const category = card.dataset.category;
                if (category === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    });
}

// Save place for later
function savePlace(placeData) {
    // Get existing saved places from localStorage
    let savedPlaces = JSON.parse(localStorage.getItem('savedPlaces')) || [];
    
    // Check if place already saved
    const isAlreadySaved = savedPlaces.some(place => place.id === placeData.id);
    
    if (!isAlreadySaved) {
        // Add to saved places
        savedPlaces.push(placeData);
        
        // Update localStorage
        localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces));
        
        // Show success notification
        showNotification('Place saved successfully!');
        
        // Update saved places UI
        updateSavedPlacesUI();
    } else {
        // Show already saved notification
        showNotification('This place is already saved.');
    }
}

// Remove saved place
function removePlace(placeId) {
    // Get existing saved places from localStorage
    let savedPlaces = JSON.parse(localStorage.getItem('savedPlaces')) || [];
    
    // Filter out the place to remove
    savedPlaces = savedPlaces.filter(place => place.id !== placeId);
    
    // Update localStorage
    localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces));
    
    // Show notification
    showNotification('Place removed from saved places.');
    
    // Update saved places UI
    updateSavedPlacesUI();
}

// Update saved places UI
function updateSavedPlacesUI() {
    const savedPlacesContainer = document.getElementById('saved-places-container');
    const savedPlaces = JSON.parse(localStorage.getItem('savedPlaces')) || [];
    
    // Clear container
    savedPlacesContainer.innerHTML = '';
    
    if (savedPlaces.length === 0) {
        savedPlacesContainer.innerHTML = '<p class="no-data">No saved places yet. Explore and save places you like!</p>';
        return;
    }
    
    // Get the template
    const template = document.getElementById('saved-place-template');
    
    // Create and append saved place cards
    savedPlaces.forEach(place => {
        const card = document.importNode(template.content, true);
        
        // Set place data
        card.querySelector('.place-name').textContent = place.name;
        card.querySelector('.place-description').textContent = place.description;
        card.querySelector('img').src = place.image || 'images/placeholder.jpg';
        card.querySelector('img').alt = place.name;
        
        // Add place ID to card for reference
        const cardElement = card.querySelector('.saved-place-card');
        cardElement.dataset.id = place.id;
        
        // Add event listeners
        card.querySelector('.view-on-map').addEventListener('click', () => {
            navigateToSection('map');
            showPlaceOnMap(place);
        });
        
        card.querySelector('.remove-place').addEventListener('click', () => {
            removePlace(place.id);
        });
        
        // Append to container
        savedPlacesContainer.appendChild(card);
    });
}

// Show a place on the map
function showPlaceOnMap(place) {
    // This function will be implemented in canvas-map.js
    // We'll just call the external function here
    centerMapOnPlace(place);
}

// Helper function to generate a unique ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Export functions that will be used by other modules
window.appFunctions = {
    showNotification,
    savePlace,
    removePlace,
    navigateToSection,
    generateUniqueId
};

// Add this notification function to app.js if it's not already there

// Notification function
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        // Create notification element
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set message
    notification.textContent = message;
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Make sure to add this to the window.appFunctions if not already there
window.appFunctions = {
    // ...existing functions
    showNotification
    // ...other functions
};