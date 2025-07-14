// Geolocation API implementation

let userLocation = null;
let watchId = null;
let locationPermissionGranted = false;

// Initialize geolocation functionality
function initGeolocation() {
    // Check if Geolocation API is available
    if (!('geolocation' in navigator)) {
        showGeolocationError("Geolocation is not supported by your browser");
        return;
    }
    
    // Set up event listeners
    document.getElementById('find-me').addEventListener('click', requestGeolocation);
}

// Request user location
function requestGeolocation() {
    // Check for geolocation permission
    if (!locationPermissionGranted) {
        navigator.permissions.query({ name: 'geolocation' })
            .then((permissionStatus) => {
                handlePermissionStatus(permissionStatus);
                
                // Listen for permission changes
                permissionStatus.onchange = () => {
                    handlePermissionStatus(permissionStatus);
                };
            })
            .catch(error => {
                console.error('Error checking geolocation permission:', error);
                // Try direct geolocation request as fallback
                getCurrentPosition();
            });
    } else {
        // Permission already granted, get current position
        getCurrentPosition();
    }
}

// Handle permission status changes
function handlePermissionStatus(permissionStatus) {
    if (permissionStatus.state === 'granted') {
        locationPermissionGranted = true;
        getCurrentPosition();
    } else if (permissionStatus.state === 'prompt') {
        // Will prompt the user
        getCurrentPosition();
    } else {
        // Permission denied
        locationPermissionGranted = false;
        showGeolocationError("Location permission denied");
    }
}

// Get the user's current position
function getCurrentPosition() {
    const options = {
        enableHighAccuracy: true,  // Use GPS if available
        timeout: 10000,            // Time to wait for position (ms)
        maximumAge: 60000          // Accept a cached position if it's not older than 1 minute
    };
    
    // Show loading indicator
    document.getElementById('find-me').textContent = 'Finding location...';
    document.getElementById('find-me').disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            handlePositionSuccess(position);
            startLocationTracking();
        },
        handlePositionError,
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
function handlePositionSuccess(position) {
    // Reset button state
    document.getElementById('find-me').textContent = 'Update My Location';
    document.getElementById('find-me').disabled = false;
    
    // Store user location
    userLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
    };
    
    // Update the map
    if (window.mapFunctions && window.mapFunctions.updateMapWithLocation) {
        window.mapFunctions.updateMapWithLocation(userLocation);
    }
    
    // Fetch nearby points of interest
    fetchNearbyPlaces(userLocation);
    
    // Update recommendations based on location
    updateRecommendations(userLocation);
    
    // Log for debugging
    console.log('User location updated:', userLocation);
}

// Handle geolocation errors
function handlePositionError(error) {
    // Reset button state
    document.getElementById('find-me').textContent = 'Try Again';
    document.getElementById('find-me').disabled = false;
    
    let errorMessage;
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            locationPermissionGranted = false;
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
}

// Display geolocation error messages
function showGeolocationError(message) {
    // Show the error using the app's notification system
    window.appFunctions.showNotification(message);
    
    // Add an error message to the map container
    const mapContainer = document.querySelector('.map-container');
    
    // Check if error message already exists
    let errorElement = mapContainer.querySelector('.geolocation-error');
    
    if (!errorElement) {
        // Create error element
        errorElement = document.createElement('div');
        errorElement.className = 'geolocation-error';
        mapContainer.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

// Fetch nearby places using the user's location
function fetchNearbyPlaces(location) {
    // Use Background Tasks API to handle the data processing
    scheduleBackgroundTask(() => {
        // Simulate network delay
        setTimeout(() => {
            const pointsOfInterestContainer = document.getElementById('points-of-interest');
            pointsOfInterestContainer.innerHTML = ''; // Clear loading indicator
            
            // Mock data for nearby places with more realistic data
            const mockPlaces = [
                {
                    id: 'poi-1',
                    name: 'Central Park',
                    type: 'attraction',
                    distance: '0.5 km',
                    description: 'Beautiful urban park with walking paths and open spaces.'
                },
                {
                    id: 'poi-2',
                    name: 'Cafe Delight',
                    type: 'restaurant',
                    distance: '0.7 km',
                    description: 'Cozy cafe with excellent coffee and pastries.'
                },
                {
                    id: 'poi-3',
                    name: 'City Museum',
                    type: 'attraction',
                    distance: '1.2 km',
                    description: 'Historical museum featuring local artifacts and exhibitions.'
                },
                {
                    id: 'poi-4',
                    name: 'Grand Hotel',
                    type: 'hotel',
                    distance: '1.5 km',
                    description: 'Luxury hotel with excellent amenities and city views.'
                },
                {
                    id: 'poi-5',
                    name: 'Italian Restaurant',
                    type: 'restaurant',
                    distance: '0.9 km',
                    description: 'Authentic Italian cuisine with homemade pasta.'
                },
                {
                    id: 'poi-6',
                    name: 'City Library',
                    type: 'attraction',
                    distance: '1.0 km',
                    description: 'Historic library with extensive book collection and quiet reading areas.'
                }
            ];
            
            // Add places to the map
            if (window.mapFunctions && window.mapFunctions.addPlacesToMap) {
                window.mapFunctions.addPlacesToMap(mockPlaces);
            }
            
            // Create POI elements
            mockPlaces.forEach(place => {
                const poiElement = document.createElement('div');
                poiElement.className = 'poi-item';
                poiElement.innerHTML = `
                    <h3>${place.name}</h3>
                    <p>${place.description}</p>
                    <div class="poi-meta">
                        <span class="poi-type">${place.type}</span>
                        <span class="poi-distance">${place.distance}</span>
                    </div>
                    <button class="btn secondary view-on-map-btn">View on Map</button>
                `;
                
                // Add event listener for the view on map button
                poiElement.querySelector('.view-on-map-btn').addEventListener('click', () => {
                    if (window.mapFunctions && window.mapFunctions.centerMapOnPlace) {
                        window.mapFunctions.centerMapOnPlace(place);
                    }
                });
                
                pointsOfInterestContainer.appendChild(poiElement);
            });
        }, 1500);
    });
}

// Update recommendations based on location
function updateRecommendations(location) {
    // Use Background Tasks API for handling recommendation updates
    scheduleBackgroundTask(() => {
        // Simulate network delay
        setTimeout(() => {
            const recommendationsContainer = document.getElementById('recommendations-container');
            
            // Clear existing recommendations
            recommendationsContainer.innerHTML = '';
            
            // Mock recommendation data with more realistic data
            const mockRecommendations = [
                {
                    id: 'rec-1',
                    name: 'Sky Lounge Restaurant',
                    description: 'Fine dining with panoramic city views',
                    category: 'restaurants',
                    rating: '4.8 ★',
                    distance: '1.2 km away',
                    image: 'https://source.unsplash.com/random/300x200/?restaurant'
                },
                {
                    id: 'rec-2',
                    name: 'Modern Art Gallery',
                    description: 'Contemporary art exhibitions and installations',
                    category: 'attractions',
                    rating: '4.6 ★',
                    distance: '0.8 km away',
                    image: 'https://source.unsplash.com/random/300x200/?art'
                },
                {
                    id: 'rec-3',
                    name: 'Boutique Hotel',
                    description: 'Charming rooms with personalized service',
                    category: 'hotels',
                    rating: '4.7 ★',
                    distance: '1.5 km away',
                    image: 'https://source.unsplash.com/random/300x200/?hotel'
                },
                {
                    id: 'rec-4',
                    name: 'Street Food Market',
                    description: 'Local cuisine and international flavors',
                    category: 'restaurants',
                    rating: '4.5 ★',
                    distance: '0.6 km away',
                    image: 'https://source.unsplash.com/random/300x200/?food'
                },
                {
                    id: 'rec-5',
                    name: 'History Museum',
                    description: 'Artifacts and exhibitions from ancient civilizations',
                    category: 'attractions',
                    rating: '4.4 ★',
                    distance: '1.1 km away',
                    image: 'https://source.unsplash.com/random/300x200/?museum'
                },
                {
                    id: 'rec-6',
                    name: 'Luxury Resort',
                    description: 'All-inclusive accommodation with spa facilities',
                    category: 'hotels',
                    rating: '4.9 ★',
                    distance: '2.0 km away',
                    image: 'https://source.unsplash.com/random/300x200/?resort'
                }
            ];
            
            // Get recommendation template
            const template = document.getElementById('recommendation-template');
            
            // Generate recommendation cards
            mockRecommendations.forEach(recommendation => {
                const card = document.importNode(template.content, true);
                
                // Set data attributes for filtering
                card.querySelector('.recommendation-card').dataset.category = recommendation.category;
                
                // Set recommendation data
                card.querySelector('.place-name').textContent = recommendation.name;
                card.querySelector('.place-description').textContent = recommendation.description;
                card.querySelector('.place-rating').textContent = recommendation.rating;
                card.querySelector('.place-distance').textContent = recommendation.distance;
                
                // Set image with lazy loading (will be observed by Intersection Observer)
                const imgElement = card.querySelector('img');
                imgElement.dataset.src = recommendation.image; // Will be loaded by Intersection Observer
                imgElement.alt = recommendation.name;
                
                // Generate random location near the user
                const placeLocation = {
                    latitude: location.latitude + (Math.random() * 0.01 - 0.005),
                    longitude: location.longitude + (Math.random() * 0.01 - 0.005)
                };
                
                // Add event listener for save button
                card.querySelector('.save-place').addEventListener('click', (e) => {
                    const placeData = {
                        id: recommendation.id,
                        name: recommendation.name,
                        description: recommendation.description,
                        image: recommendation.image,
                        category: recommendation.category,
                        location: placeLocation
                    };
                    
                    window.appFunctions.savePlace(placeData);
                });
                
                // Append to container
                recommendationsContainer.appendChild(card);
            });
            
            // Initialize intersection observer for the newly added images
            observeImages();
        }, 1000);
    });
}

// Make functions available to other scripts
window.geolocationFunctions = {
    getUserLocation: () => userLocation,
    requestGeolocation,
    stopLocationTracking
};