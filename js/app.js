// Main application file

// Global state
const appState = {
    activeSection: 'home',
    currentLocationPermission: false,
    savedPlaces: [],
    detailsModalPlace: null,
    locationUpdateCount: 0,  // Track location update notifications
    permissionModalShown: false,  // Track if permission modal is shown
    toastTimeouts: {}  // Track toast timeouts
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupMobileMenu();
    
    // Add live clock
    initClock();
});

// Main initialization function
function initApp() {
    // Load saved places from local storage
    loadSavedPlaces();
    
    // Set up navigation
    setupNavigation();
    
    // Initialize all API-dependent features
    initGeolocation();
    initCanvasMap();
    initIntersectionObserver();
    initNetworkInfo();
    initBackgroundTasks();
    initCharts();
    
    // Add event listeners
    document.getElementById('get-started-btn').addEventListener('click', () => {
        navigateToSection('map');
        if (!appState.permissionModalShown) {
            showPermissionModal();
        }
    });
    
    // Set up modal events
    document.getElementById('grant-permission').addEventListener('click', () => {
        requestGeolocation();
        closePermissionModal();
        appState.currentLocationPermission = true;
    });
    
    document.getElementById('deny-permission').addEventListener('click', () => {
        closePermissionModal();
        showToast('Location access denied. Some features will be limited.', 'warning');
    });
    
    // Close modals when clicking the close button
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            modal.classList.remove('active');
            
            // If closing permission modal, mark as shown
            if (modal.id === 'permission-modal') {
                appState.permissionModalShown = true;
            }
        });
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
    
    // Setup place details modal
    setupPlaceDetailsModal();
    
    // Update saved places UI
    updateSavedPlacesUI();
    
    // Fix stats card size
    fixStatsCardSize();
}

// Fix the stats card size
function fixStatsCardSize() {
    const statsCards = document.querySelectorAll('.stats-card');
    statsCards.forEach(card => {
        const canvas = card.querySelector('canvas');
        if (canvas) {
            // Set maximum height for canvas
            canvas.style.maxHeight = '200px';
        }
    });
}

// Setup mobile menu
function setupMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navItems = document.querySelector('.nav-items');
    
    if (menuBtn && navItems) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navItems.classList.toggle('active');
        });
        
        // Close menu when clicking a navigation link
        navItems.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                navItems.classList.remove('active');
            });
        });
    }
}

// Initialize live clock
function initClock() {
    const clockElement = document.createElement('div');
    clockElement.className = 'live-clock';
    
    // Insert after the connection status
    const connectionStatus = document.querySelector('.connection-status');
    if (connectionStatus && connectionStatus.parentNode) {
        connectionStatus.parentNode.insertBefore(clockElement, connectionStatus.nextSibling);
    }
    
    // Update clock every second
    updateClock();
    setInterval(updateClock, 1000);
}

// Update the live clock
function updateClock() {
    const clockElement = document.querySelector('.live-clock');
    if (clockElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        clockElement.textContent = timeString;
    }
}

// Load saved places from local storage
function loadSavedPlaces() {
    try {
        const savedPlaces = localStorage.getItem('savedPlaces');
        if (savedPlaces) {
            appState.savedPlaces = JSON.parse(savedPlaces);
            console.log('Loaded saved places:', appState.savedPlaces.length);
        }
    } catch (error) {
        console.error('Error loading saved places:', error);
        localStorage.removeItem('savedPlaces'); // Reset if corrupted
        appState.savedPlaces = [];
    }
}

// Save places to local storage
function savePlacesToStorage() {
    try {
        localStorage.setItem('savedPlaces', JSON.stringify(appState.savedPlaces));
    } catch (error) {
        console.error('Error saving places to storage:', error);
        showToast('Failed to save places to local storage', 'error');
    }
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
    
    // Also handle navigation from footer links
    document.querySelectorAll('footer a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').substring(1);
            navigateToSection(targetId);
            
            // Update nav links too
            navLinks.forEach(navLink => {
                if (navLink.getAttribute('href').substring(1) === targetId) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            });
        });
    });
}

function navigateToSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        appState.activeSection = sectionId;
        
        // Execute section-specific logic
        if (sectionId === 'map' && !appState.currentLocationPermission) {
            // Show permission modal if we're navigating to map without permission
            // but only if it hasn't been shown yet
            if (!appState.permissionModalShown) {
                showPermissionModal();
            }
        }
        
        // Scroll to top of section
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Modal functions
function showPermissionModal() {
    // Prevent showing multiple permission modals
    if (appState.permissionModalShown) return;
    
    const modal = document.getElementById('permission-modal');
    modal.classList.add('active');
    appState.permissionModalShown = true;
}

function closePermissionModal() {
    const modal = document.getElementById('permission-modal');
    modal.classList.remove('active');
}

// Setup place details modal
function setupPlaceDetailsModal() {
    const modal = document.getElementById('place-details-modal');
    const viewOnMapBtn = document.getElementById('detail-view-on-map');
    const saveBtn = document.getElementById('detail-save-place');
    
    viewOnMapBtn.addEventListener('click', () => {
        if (appState.detailsModalPlace) {
            navigateToSection('map');
            
            // Use setTimeout to ensure the map is loaded
            setTimeout(() => {
                if (window.mapFunctions && window.mapFunctions.centerMapOnPlace) {
                    window.mapFunctions.centerMapOnPlace(appState.detailsModalPlace);
                }
            }, 300);
            
            // Close the modal
            modal.classList.remove('active');
        }
    });
    
    saveBtn.addEventListener('click', () => {
        if (appState.detailsModalPlace) {
            savePlace(appState.detailsModalPlace);
            modal.classList.remove('active');
        }
    });
}

// Show place details in modal
function showPlaceDetails(place) {
    const modal = document.getElementById('place-details-modal');
    const placeName = document.getElementById('detail-place-name');
    const placeImg = document.getElementById('detail-place-img');
    const placeDesc = document.getElementById('detail-place-description');
    const placeRating = document.getElementById('detail-place-rating');
    const placeDistance = document.getElementById('detail-place-distance');
    const placeType = document.getElementById('detail-place-type');
    const saveBtn = document.getElementById('detail-save-place');
    
    // Store reference to place
    appState.detailsModalPlace = place;
    
    // Update modal content
    placeName.textContent = place.name;
    placeImg.src = place.image || 'images/placeholder.jpg';
    placeDesc.textContent = place.description || 'No description available';
    
    // Reset meta info
    placeRating.textContent = '';
    placeDistance.textContent = '';
    placeType.textContent = '';
    
    // Set meta info if available
    if (place.rating) {
        placeRating.textContent = place.rating;
    }
    
    if (place.distance) {
        placeDistance.textContent = place.distance;
    }
    
    if (place.type) {
        placeType.textContent = place.type;
    } else if (place.category) {
        placeType.textContent = place.category;
    }
    
    // Check if place is already saved
    const isAlreadySaved = appState.savedPlaces.some(savedPlace => savedPlace.id === place.id);
    if (isAlreadySaved) {
        saveBtn.textContent = '✓ Already Saved';
        saveBtn.disabled = true;
    } else {
        saveBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save for Later';
        saveBtn.disabled = false;
    }
    
    // Show modal
    modal.classList.add('active');
}

// Show toast notification
function showToast(message, type = 'info', uniqueId = null) {
    // If we have a uniqueId, check if we already have a toast with this ID
    // This prevents duplicate notifications
    if (uniqueId && appState.toastTimeouts[uniqueId]) {
        return; // Don't show duplicate toast
    }
    
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    let icon;
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    toast.innerHTML = icon + message;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Store timeout ID if we have a uniqueId
    const toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (toast.parentNode === toastContainer) {
                toastContainer.removeChild(toast);
            }
            
            // Clear timeout reference
            if (uniqueId) {
                delete appState.toastTimeouts[uniqueId];
            }
        }, 500);
    }, 4000);
    
    // Store timeout if we have a uniqueId
    if (uniqueId) {
        appState.toastTimeouts[uniqueId] = toastTimeout;
    }
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

// Save place for later
function savePlace(placeData) {
    console.log("Saving place:", placeData);
    
    if (!placeData || !placeData.id || !placeData.name) {
        console.error("Invalid place data:", placeData);
        showToast('Error: Could not save place due to missing data', 'error');
        return;
    }
    
    // Check if place already saved
    const isAlreadySaved = appState.savedPlaces.some(place => place.id === placeData.id);
    
    if (!isAlreadySaved) {
        // Make sure the place has an image (use placeholder if missing)
        if (!placeData.image) {
            placeData.image = 'images/placeholder.jpg';
        }
        
        // Add to saved places
        appState.savedPlaces.push(placeData);
        
        // Update localStorage
        savePlacesToStorage();
        
        // Show success notification
        showToast(`${placeData.name} saved successfully!`, 'success');
        
        // Update saved places UI
        updateSavedPlacesUI();
    } else {
        // Show already saved notification
        showToast(`${placeData.name} is already saved.`, 'info');
    }
}

// Remove saved place
function removePlace(placeId) {
    // Find the place name before removing
    const placeToRemove = appState.savedPlaces.find(place => place.id === placeId);
    const placeName = placeToRemove ? placeToRemove.name : 'Place';
    
    // Filter out the place to remove
    appState.savedPlaces = appState.savedPlaces.filter(place => place.id !== placeId);
    
    // Update localStorage
    savePlacesToStorage();
    
    // Show notification
    showToast(`${placeName} removed from saved places.`, 'success');
    
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
    
    // Clear container
    savedPlacesContainer.innerHTML = '';
    
    if (appState.savedPlaces.length === 0) {
        savedPlacesContainer.innerHTML = `
            <div class="no-data">
                <i class="fas fa-bookmark"></i>
                <p>No saved places yet. Explore and save places you like!</p>
                <button class="btn primary" onclick="navigateToSection('map')">
                    <i class="fas fa-map-marker-alt"></i> Explore Map
                </button>
            </div>
        `;
        return;
    }
    
    // Get the template
    const template = document.getElementById('saved-place-template');
    if (!template) {
        console.error("Saved place template not found");
        return;
    }
    
    // Create and append saved place cards
    appState.savedPlaces.forEach(place => {
        const card = document.importNode(template.content, true);
        
        // Set place data
        card.querySelector('.place-name').textContent = place.name;
        card.querySelector('.place-description').textContent = place.description || 'No description available';
        
        // Set badge text based on category or type
        const badge = card.querySelector('.card-badge');
        if (place.category) {
            badge.textContent = place.category;
            badge.style.backgroundColor = getCategoryColor(place.category);
        } else if (place.type) {
            badge.textContent = place.type;
            badge.style.backgroundColor = getCategoryColor(place.type);
        } else {
            badge.style.display = 'none';
        }
        
        // Handle image
        const imgElement = card.querySelector('img');
        imgElement.src = place.image || 'images/placeholder.jpg';
        imgElement.alt = place.name;
        
        // Add place ID to card for reference
        const cardElement = card.querySelector('.saved-place-card');
        cardElement.dataset.id = place.id;
        
        // Make entire card clickable to show details
        cardElement.addEventListener('click', (e) => {
            // Don't trigger if clicked on buttons
            if (!e.target.closest('.btn')) {
                showPlaceDetails(place);
            }
        });
        
        // Add event listeners for buttons
        card.querySelector('.view-on-map').addEventListener('click', () => {
            navigateToSection('map');
            if (window.mapFunctions && window.mapFunctions.centerMapOnPlace) {
                setTimeout(() => {
                    window.mapFunctions.centerMapOnPlace(place);
                }, 300);
            }
        });
        
        card.querySelector('.remove-place').addEventListener('click', () => {
            removePlace(place.id);
        });
        
        // Append to container
        savedPlacesContainer.appendChild(card);
    });
}

// Get color for category
function getCategoryColor(category) {
    const lowercaseCategory = category.toLowerCase();
    
    if (lowercaseCategory.includes('restaurant')) {
        return '#FF9800';
    } else if (lowercaseCategory.includes('hotel')) {
        return '#9C27B0';
    } else if (lowercaseCategory.includes('attraction')) {
        return '#4CAF50';
    } else {
        return '#607D8B';
    }
}

// Helper function to generate a unique ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Export functions that will be used by other modules
window.appFunctions = {
    showToast,
    savePlace,
    removePlace,
    navigateToSection,
    generateUniqueId,
    showPlaceDetails,
    getCategoryColor
};