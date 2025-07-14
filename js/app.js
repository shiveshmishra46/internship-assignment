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
    
    // Load saved places when app starts
    updateSavedPlacesUI();
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
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
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

// Save place for later - Fixed to properly save and handle data
function savePlace(placeData) {
    console.log("Saving place:", placeData);
    
    // Ensure placeData has all required fields and is properly formatted
    if (!placeData || !placeData.id || !placeData.name) {
        console.error("Invalid place data:", placeData);
        showNotification('Error: Could not save place due to missing data');
        return;
    }
    
    // Get existing saved places from localStorage
    let savedPlaces = [];
    try {
        const storedPlaces = localStorage.getItem('savedPlaces');
        if (storedPlaces) {
            savedPlaces = JSON.parse(storedPlaces);
        }
    } catch (error) {
        console.error("Error parsing saved places:", error);
        localStorage.removeItem('savedPlaces'); // Reset if corrupted
    }
    
    // Check if place already saved
    const isAlreadySaved = savedPlaces.some(place => place.id === placeData.id);
    
    if (!isAlreadySaved) {
        // Make sure the place has an image (use placeholder if missing)
        if (!placeData.image) {
            placeData.image = 'images/placeholder.jpg';
        }
        
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
    let savedPlaces = [];
    try {
        const storedPlaces = localStorage.getItem('savedPlaces');
        if (storedPlaces) {
            savedPlaces = JSON.parse(storedPlaces);
        }
    } catch (error) {
        console.error("Error parsing saved places:", error);
    }
    
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
    if (!savedPlacesContainer) {
        console.error("Saved places container not found");
        return;
    }
    
    let savedPlaces = [];
    try {
        const storedPlaces = localStorage.getItem('savedPlaces');
        if (storedPlaces) {
            savedPlaces = JSON.parse(storedPlaces);
        }
    } catch (error) {
        console.error("Error parsing saved places:", error);
    }
    
    // Clear container
    savedPlacesContainer.innerHTML = '';
    
    if (savedPlaces.length === 0) {
        savedPlacesContainer.innerHTML = '<p class="no-data">No saved places yet. Explore and save places you like!</p>';
        return;
    }
    
    // Get the template
    const template = document.getElementById('saved-place-template');
    if (!template) {
        console.error("Saved place template not found");
        return;
    }
    
    // Create and append saved place cards
    savedPlaces.forEach(place => {
        const card = document.importNode(template.content, true);
        
        // Set place data
        card.querySelector('.place-name').textContent = place.name;
        card.querySelector('.place-description').textContent = place.description;
        
        // Handle image
        const imgElement = card.querySelector('img');
        imgElement.src = place.image || 'images/placeholder.jpg';
        imgElement.alt = place.name;
        
        // Add place ID to card for reference
        const cardElement = card.querySelector('.saved-place-card');
        cardElement.dataset.id = place.id;
        
        // Add event listeners
        card.querySelector('.view-on-map').addEventListener('click', () => {
            navigateToSection('map');
            if (window.mapFunctions && window.mapFunctions.centerMapOnPlace) {
                window.mapFunctions.centerMapOnPlace(place);
            }
        });
        
        card.querySelector('.remove-place').addEventListener('click', () => {
            removePlace(place.id);
        });
        
        // Append to container
        savedPlacesContainer.appendChild(card);
    });
}

// Show a place on the map
function showPlaceDetails(placeId) {
    console.log("Showing place details:", placeId);
    // Find place data
    let savedPlaces = [];
    try {
        const storedPlaces = localStorage.getItem('savedPlaces');
        if (storedPlaces) {
            savedPlaces = JSON.parse(storedPlaces);
        }
    } catch (error) {
        console.error("Error parsing saved places:", error);
    }
    
    const place = savedPlaces.find(p => p.id === placeId);
    if (place) {
        // Navigate to saved section
        navigateToSection('saved');
        
        // Highlight the place card
        setTimeout(() => {
            const placeCard = document.querySelector(`.saved-place-card[data-id="${placeId}"]`);
            if (placeCard) {
                placeCard.classList.add('highlight');
                placeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                setTimeout(() => {
                    placeCard.classList.remove('highlight');
                }, 2000);
            }
        }, 300);
    }
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
    generateUniqueId,
    showPlaceDetails
};