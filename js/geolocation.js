// Geolocation API implementation

// State variables
let userLocation = null;
let watchId = null;
let locationPermissionGranted = false;
let nearbyPlacesLoaded = false;
let recommendationsLoaded = false;
let locationUpdateTimestamp = 0;
let isLocationUpdateInProgress = false;

// Initialize geolocation functionality
function initGeolocation() {
    console.log("Initializing Geolocation API");
    
    // Check if Geolocation API is available
    if (!('geolocation' in navigator)) {
        showGeolocationError("Geolocation is not supported by your browser");
        return;
    }
    
    // Check initial permission status
    checkLocationPermission();
    
    // Set up event listeners
    document.getElementById('find-me').addEventListener('click', requestGeolocation);
}

// Check location permission status
function checkLocationPermission() {
    if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' })
            .then((permissionStatus) => {
                if (permissionStatus.state === 'granted') {
                    locationPermissionGranted = true;
                    // Auto-request position if permission is already granted
                    getCurrentPosition(true);
                    
                    // Update global state
                    if (window.appState) {
                        window.appState.locationPermissionGranted = true;
                        window.appState.permissionModalShown = true;
                    }
                }
                
                // Listen for permission changes
                permissionStatus.onchange = () => {
                    locationPermissionGranted = (permissionStatus.state === 'granted');
                    
                    if (window.appState) {
                        window.appState.locationPermissionGranted = locationPermissionGranted;
                    }
                };
            })
            .catch(error => {
                console.error('Error checking geolocation permission:', error);
            });
    }
}

// Request user location
function requestGeolocation() {
    if (isLocationUpdateInProgress) return;
    
    isLocationUpdateInProgress = true;
    
    // Check for geolocation permission
    if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' })
            .then((permissionStatus) => {
                handlePermissionStatus(permissionStatus);
            })
            .catch(error => {
                console.error('Error checking geolocation permission:', error);
                getCurrentPosition();
            });
    } else {
        // Direct request if Permissions API is not available
        getCurrentPosition();
    }
}

// Handle permission status changes
function handlePermissionStatus(permissionStatus) {
    if (permissionStatus.state === 'granted') {
        locationPermissionGranted = true;
        getCurrentPosition();
        
        if (window.appState) {
            window.appState.locationPermissionGranted = true;
        }
    } else if (permissionStatus.state === 'prompt') {
        // Will prompt the user
        getCurrentPosition();
    } else {
        // Permission denied
        locationPermissionGranted = false;
        showGeolocationError("Location permission denied");
        isLocationUpdateInProgress = false;
        
        if (window.appState) {
            window.appState.locationPermissionGranted = false;
        }
    }
}

// Get the user's current position
function getCurrentPosition(isInitial = false) {
    const options = {
        enableHighAccuracy: true,  // Use GPS if available
        timeout: 10000,            // Time to wait for position (ms)
        maximumAge: 30000          // Accept a cached position if it's not older than 30 seconds
    };
    
    // Show loading state
    const findMeButton = document.getElementById('find-me');
    if (findMeButton) {
        findMeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding location...';
        findMeButton.disabled = true;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            handlePositionSuccess(position, isInitial);
            startLocationTracking();
        },
        (error) => {
            handlePositionError(error);
            isLocationUpdateInProgress = false;
        },
        options
    );
}

// Start tracking user location for continuous updates
function startLocationTracking() {
    // Only start tracking if we're not already tracking
    if (watchId === null) {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        };
        
        watchId = navigator.geolocation.watchPosition(
            handlePositionSuccess,
            handlePositionError,
            options
        );
    }
}

// Stop tracking user location
function stopLocationTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

// Handle successful geolocation
function handlePositionSuccess(position, isInitial = false) {
    // Reset button state
    const findMeButton = document.getElementById('find-me');
    if (findMeButton) {
        findMeButton.innerHTML = '<i class="fas fa-location-crosshairs"></i> Update My Location';
        findMeButton.disabled = false;
    }
    
    // Store user location
    const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
    };
    
    // Check if this is a new location or significant change
    const isNewLocation = isSignificantLocationChange(newLocation);
    
    // Only process if it's a new location or initial load
    if (isNewLocation || isInitial || !userLocation) {
        // Save the new location
        userLocation = newLocation;
        
        // Update application state
        if (window.appState) {
            window.appState.locationPermissionGranted = true;
        }
        
        // Update the map
        if (window.mapFunctions && window.mapFunctions.updateMapWithLocation) {
            window.mapFunctions.updateMapWithLocation(userLocation);
        }
        
        // Load nearby places and recommendations based on active section or if not loaded before
        const activeSection = window.appState ? window.appState.activeSection : null;
        
        if (!nearbyPlacesLoaded || activeSection === 'map') {
            fetchNearbyPlaces(userLocation);
            nearbyPlacesLoaded = true;
        }
        
        if (!recommendationsLoaded || activeSection === 'recommendations') {
            updateRecommendations(userLocation);
            recommendationsLoaded = true;
        }
        
        // Show success message only if it's not the initial load and it's a significant change
        if (!isInitial && isNewLocation && window.appFunctions && window.appFunctions.showToast) {
            // Check time since last notification to avoid duplicates
            const currentTime = Date.now();
            if (currentTime - locationUpdateTimestamp > 5000) { // 5 second minimum between notifications
                window.appFunctions.showToast('Location updated successfully', 'success');
                locationUpdateTimestamp = currentTime;
            }
        }
        
        // Log for debugging
        console.log('User location updated:', userLocation);
    }
    
    // Reset flag
    isLocationUpdateInProgress = false;
}

// Check if location change is significant enough to trigger updates
function isSignificantLocationChange(newLocation) {
    if (!userLocation) return true;
    
    // Calculate distance between points
    const distance = calculateDistance(
        userLocation.latitude, userLocation.longitude,
        newLocation.latitude, newLocation.longitude
    );
    
    // Consider significant if more than 10 meters or more than 1 minute passed
    return distance > 0.01 || 
           Math.abs(newLocation.timestamp - userLocation.timestamp) > 60000;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Handle geolocation errors
function handlePositionError(error) {
    // Reset button state
    const findMeButton = document.getElementById('find-me');
    if (findMeButton) {
        findMeButton.innerHTML = '<i class="fas fa-location-crosshairs"></i> Try Again';
        findMeButton.disabled = false;
    }
    
    let errorMessage;
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            locationPermissionGranted = false;
            if (window.appState) {
                window.appState.locationPermissionGranted = false;
            }
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
        case error.TIMEOUT:
            errorMessage = "Request to get location timed out";
            break;
        case error.UNKNOWN_ERROR:
            errorMessage = "An unknown error occurred";
            break;
    }
    
    showGeolocationError(errorMessage);
    isLocationUpdateInProgress = false;
}

// Display geolocation error messages
function showGeolocationError(message) {
    // Show the error using the app's notification system
    if (window.appFunctions && window.appFunctions.showToast) {
        window.appFunctions.showToast(message, 'error');
    }
    
    // Add an error message to the map container
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;
    
    // Check if error message already exists
    let errorElement = mapContainer.querySelector('.geolocation-error');
    
    if (!errorElement) {
        // Create error element
        errorElement = document.createElement('div');
        errorElement.className = 'geolocation-error';
        mapContainer.appendChild(errorElement);
    }
    
    errorElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    
    // Remove error after 5 seconds
    setTimeout(() => {
        if (errorElement.parentNode === mapContainer) {
            mapContainer.removeChild(errorElement);
        }
    }, 5000);
}

// Fetch nearby places using the user's location
function fetchNearbyPlaces(location) {
    // Get the container
    const pointsOfInterestContainer = document.getElementById('points-of-interest');
    if (!pointsOfInterestContainer) return;
    
    // Show loading indicator
    pointsOfInterestContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Loading nearby places...</p>
        </div>
    `;
    
    // Use Background Tasks API to handle the data processing
    scheduleBackgroundTask(() => {
        // Simulate network delay (would be an API call in a real app)
        setTimeout(() => {
            // Generate mock places data
            const mockPlaces = [
                {
                    id: 'poi-1',
                    name: 'Central Park',
                    type: 'attraction',
                    distance: '0.5 km',
                    description: 'Beautiful urban park with walking paths and open spaces.',
                    image: 'images/placeholder.jpg'
                },
                {
                    id: 'poi-2',
                    name: 'Cafe Delight',
                    type: 'restaurant',
                    distance: '0.7 km',
                    description: 'Cozy cafe with excellent coffee and pastries.',
                    image: 'images/placeholder.jpg'
                },
                {
                    id: 'poi-3',
                    name: 'City Museum',
                    type: 'attraction',
                    distance: '1.2 km',
                    description: 'Historical museum featuring local artifacts and exhibitions.',
                    image: 'images/placeholder.jpg'
                },
                {
                    id: 'poi-4',
                    name: 'Grand Hotel',
                    type: 'hotel',
                    distance: '1.5 km',
                    description: 'Luxury hotel with excellent amenities and city views.',
                    image: 'images/placeholder.jpg'
                },
                {
                    id: 'poi-5',
                    name: 'Italian Restaurant',
                    type: 'restaurant',
                    distance: '0.9 km',
                    description: 'Authentic Italian cuisine with homemade pasta.',
                    image: 'images/placeholder.jpg'
                },
                {
                    id: 'poi-6',
                    name: 'City Library',
                    type: 'attraction',
                    distance: '1.0 km',
                    description: 'Historic library with extensive book collection and quiet reading areas.',
                    image: 'images/placeholder.jpg'
                }
            ];
            
            // Add places to the map
            if (window.mapFunctions && window.mapFunctions.addPlacesToMap) {
                window.mapFunctions.addPlacesToMap(mockPlaces, location);
            }
            
            // Clear container
            pointsOfInterestContainer.innerHTML = '';
            
            // Get the template
            const template = document.getElementById('poi-template');
            if (!template) {
                pointsOfInterestContainer.innerHTML = '<p>Error loading template</p>';
                return;
            }
            
            // Create POI elements
            mockPlaces.forEach(place => {
                // Add location for saving functionality
                place.location = {
                    latitude: location.latitude + (Math.random() * 0.01 - 0.005),
                    longitude: location.longitude + (Math.random() * 0.01 - 0.005)
                };
                
                const poiElement = document.importNode(template.content, true);
                
                // Set place data
                poiElement.querySelector('.poi-name').textContent = place.name;
                poiElement.querySelector('.poi-description').textContent = place.description;
                
                // Set type
                const typeElement = poiElement.querySelector('.poi-type');
                typeElement.textContent = place.type;
                typeElement.dataset.type = place.type;
                
                // Set distance
                poiElement.querySelector('.poi-distance').textContent = place.distance;
                
                // Add event listeners
                poiElement.querySelector('.view-on-map-btn').addEventListener('click', () => {
                    if (window.mapFunctions && window.mapFunctions.centerMapOnPlace) {
                        window.mapFunctions.centerMapOnPlace(place);
                    }
                });
                
                poiElement.querySelector('.save-poi-btn').addEventListener('click', () => {
                    if (window.appFunctions && window.appFunctions.savePlace) {
                        window.appFunctions.savePlace(place);
                    }
                });
                
                // Add to container
                pointsOfInterestContainer.appendChild(poiElement);
            });
        }, 1500);
    });
}

// Update recommendations based on location
function updateRecommendations(location) {
    // Get container
    const recommendationsContainer = document.getElementById('recommendations-container');
    if (!recommendationsContainer) return;
    
    // Show loading indicator
    recommendationsContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Loading recommendations...</p>
        </div>
    `;
    
    // Use Background Tasks API for handling recommendation updates
    scheduleBackgroundTask(() => {
        // Simulate network delay
        setTimeout(() => {
            // Mock recommendation data
            const mockRecommendations = [
                {
                    id: 'rec-1',
                    name: 'Sky Lounge Restaurant',
                    description: 'Fine dining with panoramic city views',
                    category: 'restaurants',
                    rating: '4.8 ★',
                    distance: '1.2 km away',
                    image: 'images/placeholder.jpg'
                },
                {
                    id: 'rec-2',
                    name: 'Modern Art Gallery',
                    description: 'Contemporary art exhibitions and installations',
                    category: 'attractions',
                    rating: '4.6 ★',
                    distance: '0.8 km away',
                    image: 'images/placeholder.jpg'
                },
                {
                    id: 'rec-3',
                    name: 'Boutique Hotel',
                    description: 'Charming rooms with personalized service',
                    category: 'hotels',
                    rating: '4.7 ★',
                    distance: '1.5 km away',
                    image: 'images/placeholder.jpg'
                },
                {
                    id: 'rec-4',
                    name: 'Street Food Market',
                    description: 'Local cuisine and international flavors',
                    category: 'restaurants',
                    rating: '4.5 ★',
                    distance: '0.6 km away',
                    image: 'images/placeholder.jpg'
                },
                {
                    id: 'rec-5',
                    name: 'History Museum',
                    description: 'Artifacts and exhibitions from ancient civilizations',
                    category: 'attractions',
                    rating: '4.4 ★',
                    distance: '1.1 km away',
                    image: 'images/placeholder.jpg'
                },
                {
                    id: 'rec-6',
                    name: 'Luxury Resort',
                    description: 'All-inclusive accommodation with spa facilities',
                    category: 'hotels',
                    rating: '4.9 ★',
                    distance: '2.0 km away',
                    image: 'images/placeholder.jpg'
                }
            ];
            
            // Clear container
            recommendationsContainer.innerHTML = '';
            
            // Get recommendation template
            const template = document.getElementById('recommendation-template');
            if (!template) {
                recommendationsContainer.innerHTML = '<p>Error loading template</p>';
                return;
            }
            
            // Generate recommendation cards
            mockRecommendations.forEach(recommendation => {
                const card = document.importNode(template.content, true);
                
                // Set data attributes for filtering
                const cardElement = card.querySelector('.recommendation-card');
                cardElement.dataset.category = recommendation.category;
                
                // Set badge based on category
                const badge = card.querySelector('.card-badge');
                badge.textContent = recommendation.category;
                if (window.appFunctions && window.appFunctions.getCategoryColor) {
                    badge.style.backgroundColor = window.appFunctions.getCategoryColor(recommendation.category);
                }
                
                // Set recommendation data
                card.querySelector('.place-name').textContent = recommendation.name;
                card.querySelector('.place-description').textContent = recommendation.description;
                card.querySelector('.place-rating').textContent = recommendation.rating;
                card.querySelector('.place-distance').textContent = recommendation.distance;
                
                // Set image with lazy loading (will be observed by Intersection Observer)
                const imgElement = card.querySelector('img');
                imgElement.dataset.src = recommendation.image;
                imgElement.alt = recommendation.name;
                
                // Generate random location near the user
                const placeLocation = {
                    latitude: location.latitude + (Math.random() * 0.01 - 0.005),
                    longitude: location.longitude + (Math.random() * 0.01 - 0.005)
                };
                
                // Make card clickable to show details
                cardElement.addEventListener('click', (e) => {
                    // Don't trigger if clicked on save button
                    if (!e.target.closest('.save-place') && window.appFunctions && 
                        window.appFunctions.showPlaceDetails) {
                        window.appFunctions.showPlaceDetails({
                            id: recommendation.id,
                            name: recommendation.name,
                            description: recommendation.description,
                            image: recommendation.image,
                            category: recommendation.category,
                            location: placeLocation,
                            rating: recommendation.rating,
                            distance: recommendation.distance
                        });
                    }
                });
                
                // Add event listener for save button
                card.querySelector('.save-place').addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent card click event
                    
                    const placeData = {
                        id: recommendation.id,
                        name: recommendation.name,
                        description: recommendation.description,
                        image: recommendation.image,
                        category: recommendation.category,
                        location: placeLocation,
                        rating: recommendation.rating,
                        distance: recommendation.distance
                    };
                    
                    if (window.appFunctions && window.appFunctions.savePlace) {
                        window.appFunctions.savePlace(placeData);
                    }
                });
                
                // Append to container
                recommendationsContainer.appendChild(card);
            });
            
            // Initialize intersection observer for the newly added images
            if (window.observerFunctions && window.observerFunctions.observeImages) {
                window.observerFunctions.observeImages();
            }
        }, 1500);
    });
}

// Reset loaded flags to force refresh
function resetLoadedFlags() {
    nearbyPlacesLoaded = false;
    recommendationsLoaded = false;
}

// Make functions available to other scripts
window.geolocationFunctions = {
    getUserLocation: () => userLocation,
    requestGeolocation,
    stopLocationTracking,
    fetchNearbyPlaces,
    updateRecommendations,
    resetLoadedFlags,
    isLocationPermissionGranted: () => locationPermissionGranted,
    checkLocationPermission
};