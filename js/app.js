/**
 * Smart Travel Companion - Main Application
 * This is the main application file that initializes all components and features
 * Last updated: 2025-07-16
 */

// Application state
const appState = {
    currentLocationPermission: false,
    activeSection: 'home',
    detailsModalPlace: null,
    savedPlaces: [],
    permissionModalShown: false,
    toastTimeouts: {},
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Smart Travel Companion initialized');
    
    // Load saved places from localStorage
    loadSavedPlaces();
    
    // Set up navigation
    setupNavigation();
    
    // Set up modals
    setupModals();
    
    // Check location permission
    checkLocationPermission();
    
    // Set up recommendation filters
    setupRecommendationFilters();
    
    // Update saved places UI
    updateSavedPlacesUI();
    
    // Update offline message visibility based on connection status
    updateOfflineMessageVisibility();
    
    // Add event listener for online/offline status
    window.addEventListener('online', updateOfflineMessageVisibility);
    window.addEventListener('offline', updateOfflineMessageVisibility);
});

// Load saved places from localStorage
function loadSavedPlaces() {
    const savedPlacesData = localStorage.getItem('savedPlaces');
    if (savedPlacesData) {
        try {
            appState.savedPlaces = JSON.parse(savedPlacesData);
        } catch (e) {
            console.error('Error loading saved places:', e);
            appState.savedPlaces = [];
        }
    }
}

// Save places to localStorage
function savePlacesToStorage() {
    try {
        localStorage.setItem('savedPlaces', JSON.stringify(appState.savedPlaces));
    } catch (e) {
        console.error('Error saving places to localStorage:', e);
        showToast('Error saving your places. Storage may be full.', 'error');
    }
}

// Set up navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('[data-nav]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').substring(1);
            navigateToSection(targetId);
        });
    });
    
    // Check URL hash on page load
    if (location.hash) {
        const sectionId = location.hash.substring(1);
        navigateToSection(sectionId);
    }
}

// Navigate to section
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
        
        // Update navigation links
        const navLinks = document.querySelectorAll('[data-nav]');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('active');
            }
        });
        
        // Update URL hash
        if (history.pushState) {
            history.pushState(null, null, '#' + sectionId);
        } else {
            location.hash = '#' + sectionId;
        }
        
        // Scroll to top of section
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Check location permission
function checkLocationPermission() {
    if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then(function(result) {
            if (result.state === 'granted') {
                // Permission already granted
                appState.currentLocationPermission = true;
                
                // Initialize geolocation if on map section
                if (appState.activeSection === 'map') {
                    initializeGeolocation();
                }
            } else if (result.state === 'prompt') {
                // We need to ask for permission
                // Wait for user to navigate to map section
            } else if (result.state === 'denied') {
                // Permission denied, show toast
                showToast('Location access denied. Some features may not work properly.', 'error');
            }
            
            // Listen for changes in permission state
            result.addEventListener('change', function() {
                if (result.state === 'granted') {
                    appState.currentLocationPermission = true;
                    initializeGeolocation();
                    showToast('Location access granted!', 'success');
                }
            });
        });
    } else {
        // Older browsers without Permissions API
        if ('geolocation' in navigator) {
            // We'll check when user navigates to map
        } else {
            showToast('Geolocation is not supported by your browser.', 'error');
        }
    }
}

// Set up recommendation filters
function setupRecommendationFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Get filter value
            const filter = this.dataset.filter;
            filterRecommendations(filter);
        });
    });
}

// Set up modals
function setupModals() {
    // Place details modal
    setupPlaceDetailsModal();
    
    // Permission modal
    setupPermissionModal();
    
    // General modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        const modal = button.closest('.modal');
        if (modal) {
            button.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
    });
    
    // Close on click outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Setup permission modal
function setupPermissionModal() {
    const modal = document.getElementById('permission-modal');
    
    if (modal) {
        // Grant permission button
        const grantBtn = document.getElementById('grant-permission');
        if (grantBtn) {
            grantBtn.addEventListener('click', () => {
                // Request geolocation permission
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        // Success
                        function(position) {
                            appState.currentLocationPermission = true;
                            modal.classList.remove('active');
                            showToast('Location access granted!', 'success');
                            initializeGeolocation();
                        },
                        // Error
                        function(error) {
                            modal.classList.remove('active');
                            console.error('Geolocation error:', error);
                            showToast('Location access denied. Some features may not work.', 'error');
                        }
                    );
                }
            });
        }
        
        // Deny permission button
        const denyBtn = document.getElementById('deny-permission');
        if (denyBtn) {
            denyBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                showToast('Location access denied. Some features may not work.', 'info');
            });
        }
    }
}

// Show permission modal
function showPermissionModal() {
    // Prevent showing multiple permission modals
    if (appState.permissionModalShown) return;
    
    const modal = document.getElementById('permission-modal');
    if (modal) {
        modal.classList.add('active');
        appState.permissionModalShown = true;
    }
}

// Update offline message visibility
function updateOfflineMessageVisibility() {
    const offlineMessage = document.getElementById('offline-message');
    if (offlineMessage) {
        if (navigator.onLine) {
            offlineMessage.style.display = 'none';
        } else {
            offlineMessage.style.display = 'flex';
        }
    }
}

// Export global functions for other modules
window.appFunctions = {
    navigateToSection,
    showToast,
    savePlace,
    removePlace,
    showPlaceDetails,
    getCategoryColor,
    formatDistance,
};