/**
 * Geolocation Utilities
 * Handles location permission and geolocation functions
 * Last updated: 2025-07-16
 */

// Initialize geolocation
function initializeGeolocation() {
    if ('geolocation' in navigator) {
        // Add click handler to the locate me button
        const findMeButton = document.getElementById('find-me');
        if (findMeButton) {
            findMeButton.addEventListener('click', function() {
                // Show loading spinner
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
                this.disabled = true;
                
                // Get current position
                navigator.geolocation.getCurrentPosition(function(position) {
                    // Success
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    
                    // Update map
                    if (window.mapFunctions && window.mapFunctions.centerMap) {
                        window.mapFunctions.centerMap(latitude, longitude);
                    }
                    
                    // Reset button
                    findMeButton.innerHTML = '<i class="fas fa-location-crosshairs"></i> Locate Me';
                    findMeButton.disabled = false;
                    
                    // Show toast
                    if (window.showToast) {
                        window.showToast('Location updated successfully!', 'success');
                    }
                    
                    // Load nearby recommendations
                    if (window.loadNearbyRecommendations) {
                        window.loadNearbyRecommendations(latitude, longitude);
                    }
                    
                }, function(error) {
                    // Error
                    console.error('Error getting location:', error);
                    
                    // Reset button
                    findMeButton.innerHTML = '<i class="fas fa-location-crosshairs"></i> Locate Me';
                    findMeButton.disabled = false;
                    
                    // Show error message
                    let errorMessage = 'Unable to retrieve your location.';
                    if (error.code === 1) {
                        errorMessage = 'Location access denied. Please enable location services.';
                    } else if (error.code === 2) {
                        errorMessage = 'Location unavailable. Please try again later.';
                    } else if (error.code === 3) {
                        errorMessage = 'Location request timed out. Please try again.';
                    }
                    
                    if (window.showToast) {
                        window.showToast(errorMessage, 'error');
                    }
                }, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });
        }
        
        // Show POIs button handler
        const showPoisButton = document.getElementById('show-pois');
        if (showPoisButton) {
            showPoisButton.addEventListener('click', function() {
                if (window.mapFunctions && window.mapFunctions.togglePointsOfInterest) {
                    window.mapFunctions.togglePointsOfInterest();
                }
            });
        }
    }
}

// Calculate distance between two coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Load nearby recommendations
function loadNearbyRecommendations(latitude, longitude) {
    // If we have mock recommendation data
    if (window.mockRecommendations) {
        const recommendationsContainer = document.getElementById('recommendations-container');
        if (recommendationsContainer) {
            // Clear loading indicator
            recommendationsContainer.innerHTML = '';
            
            // Calculate distances for each recommendation
            window.mockRecommendations.forEach(place => {
                if (place.location && place.location.latitude && place.location.longitude) {
                    place.distance = calculateDistance(
                        latitude, longitude,
                        place.location.latitude, place.location.longitude
                    );
                }
            });
            
            // Sort by distance
            window.mockRecommendations.sort((a, b) => a.distance - b.distance);
            
            // Render recommendations if available
            if (window.renderRecommendations) {
                window.renderRecommendations(window.mockRecommendations);
            }
        }
    }
    
    // Update POIs on map
    if (window.mapFunctions && window.mapFunctions.addPointsOfInterest) {
        window.mapFunctions.addPointsOfInterest(window.mockRecommendations);
    }
}

// Format distance for display
function formatDistance(distance) {
    if (distance < 1) {
        return `${(distance * 1000).toFixed(0)}m`;
    } else {
        return `${distance.toFixed(1)}km`;
    }
}

// Export functions for other modules
if (typeof window !== 'undefined') {
    window.initializeGeolocation = initializeGeolocation;
    window.calculateDistance = calculateDistance;
    window.loadNearbyRecommendations = loadNearbyRecommendations;
    window.formatDistance = formatDistance;
}