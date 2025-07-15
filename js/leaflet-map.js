// Leaflet Map implementation

// Map variables
let map;
let userMarker;
let userAccuracyCircle;
let placeMarkers = [];
let mapReady = false;

// Initialize Leaflet map
function initCanvasMap() {
    console.log("Initializing Leaflet map");
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        return;
    }

    try {
        // Get map container
        const mapContainer = document.getElementById('map-element');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }
        
        // Create map
        map = L.map('map-element', {
            center: [40.7128, -74.0060], // Default center (NYC)
            zoom: 13,
            attributionControl: true,
            zoomControl: false // We'll use our own zoom controls
        });

        // Add tile layer (streets)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Set up custom zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => {
            map.zoomIn(1);
        });
        
        document.getElementById('zoom-out').addEventListener('click', () => {
            map.zoomOut(1);
        });

        // Set map as ready
        mapReady = true;
        
        // Fix map display issues
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
        
        // Initial map display (if geolocation is already available)
        const userLocation = window.geolocationFunctions?.getUserLocation();
        if (userLocation) {
            updateMapWithLocation(userLocation);
        }

    } catch (error) {
        console.error('Error initializing map:', error);
        window.appFunctions.showToast('Failed to initialize map', 'error');
    }
}

// Update map with user's location
function updateMapWithLocation(location) {
    if (!mapReady || !location || !map) {
        console.warn("Map not ready or location not available");
        return;
    }
    
    try {
        const userLatLng = [location.latitude, location.longitude];
        
        // Set map view to user's location
        map.setView(userLatLng, 15);
        
        // Create/update user marker
        if (userMarker) {
            // Update existing marker
            userMarker.setLatLng(userLatLng);
        } else {
            // Create new marker with custom icon
            const userIcon = L.divIcon({
                className: 'user-marker-icon',
                html: '<div class="user-marker-pulse"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            userMarker = L.marker(userLatLng, {
                icon: userIcon,
                title: 'Your Location',
                zIndexOffset: 1000 // Make sure user marker is on top
            }).addTo(map);
            
            // Add popup with user info
            userMarker.bindPopup("<strong>You are here!</strong><br>This is your current location.");
        }
        
        // Update accuracy circle
        if (location.accuracy) {
            if (userAccuracyCircle) {
                // Update existing circle
                userAccuracyCircle.setLatLng(userLatLng);
                userAccuracyCircle.setRadius(location.accuracy);
            } else {
                // Create new circle
                userAccuracyCircle = L.circle(userLatLng, {
                    radius: location.accuracy,
                    color: '#4285F4',
                    fillColor: '#4285F4',
                    fillOpacity: 0.2,
                    weight: 1
                }).addTo(map);
            }
        }
        
        console.log("Map updated with user location");
        
    } catch (error) {
        console.error('Error updating map with location:', error);
        window.appFunctions.showToast('Error updating map with your location', 'error');
    }
}

// Add places to the map
function addPlacesToMap(places, userLocation) {
    if (!mapReady || !map) {
        console.warn("Map not ready");
        return;
    }
    
    try {
        // Clear existing place markers
        clearPlaceMarkers();
        
        if (!userLocation) {
            userLocation = window.geolocationFunctions?.getUserLocation();
            
            if (!userLocation) {
                console.warn("User location not available for place markers");
                // Use map center as fallback
                const mapCenter = map.getCenter();
                userLocation = {
                    latitude: mapCenter.lat,
                    longitude: mapCenter.lng
                };
            }
        }
        
        // Add markers for each place
        places.forEach((place, index) => {
            // Generate consistent location based on index
            const angle = (index / places.length) * Math.PI * 2;
            const distance = 0.005 + (Math.random() * 0.01);
            
            const placeLocation = {
                latitude: userLocation.latitude + Math.sin(angle) * distance,
                longitude: userLocation.longitude + Math.cos(angle) * distance
            };
            
            // Associate location with place for future use
            place.location = placeLocation;
            
            const markerLatLng = [placeLocation.latitude, placeLocation.longitude];
            
            // Create icon based on place type
            let iconHtml;
            
            switch (place.type) {
                case 'restaurant':
                    iconHtml = '<i class="fas fa-utensils"></i>';
                    break;
                case 'hotel':
                    iconHtml = '<i class="fas fa-hotel"></i>';
                    break;
                case 'attraction':
                    iconHtml = '<i class="fas fa-landmark"></i>';
                    break;
                default:
                    iconHtml = '<i class="fas fa-map-pin"></i>';
            }
            
            const icon = L.divIcon({
                className: 'place-marker-icon',
                html: `<div class="place-icon" style="background-color: ${window.appFunctions.getCategoryColor(place.type)}">${iconHtml}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });
            
            // Create and add marker
            const marker = L.marker(markerLatLng, {
                icon: icon,
                title: place.name
            }).addTo(map);
            
            // Create popup content with save button
            const popupContent = `
                <div class="place-popup">
                    <h3>${place.name}</h3>
                    <p>${place.description}</p>
                    <p class="place-distance">${place.distance}</p>
                    <button class="popup-save-btn" onclick="saveThisPlace('${place.id}')">
                        <i class="fas fa-bookmark"></i> Save Place
                    </button>
                </div>
            `;
            
            // Add popup with info
            const popup = L.popup({
                closeButton: true,
                autoClose: true,
                className: 'place-popup-container'
            }).setContent(popupContent);
            
            marker.bindPopup(popup);
            
            // Store reference to marker and place
            placeMarkers.push({
                id: place.id,
                marker: marker,
                place: place
            });
        });
        
        // Add global save function that the popup can call
        window.saveThisPlace = function(placeId) {
            const placeMarker = placeMarkers.find(item => item.id === placeId);
            if (placeMarker && placeMarker.place) {
                if (window.appFunctions && window.appFunctions.savePlace) {
                    window.appFunctions.savePlace(placeMarker.place);
                }
            }
        };
        
        console.log(`Added ${places.length} places to map`);
        
    } catch (error) {
        console.error('Error adding places to map:', error);
        window.appFunctions.showToast('Error displaying places on map', 'error');
    }
}

// Clear all place markers from the map
function clearPlaceMarkers() {
    placeMarkers.forEach(item => {
        if (item.marker && map) {
            map.removeLayer(item.marker);
        }
    });
    
    placeMarkers = [];
}

// Center map on a specific place
function centerMapOnPlace(place) {
    if (!mapReady || !map || !place || !place.location) {
        console.warn("Map not ready or place has no location", place);
        return;
    }
    
    try {
        const placeLatLng = [place.location.latitude, place.location.longitude];
        
        // Set map view to place location
        map.setView(placeLatLng, 17);
        
        // Find existing marker
        const existingMarker = placeMarkers.find(item => item.id === place.id);
        
        if (existingMarker) {
            // Open popup for existing marker
            existingMarker.marker.openPopup();
            
            // Highlight marker with bounce animation
            const icon = existingMarker.marker.getIcon();
            const iconElement = document.querySelector(`.place-icon[data-id="${place.id}"]`);
            if (iconElement) {
                iconElement.classList.add('bounce');
                setTimeout(() => {
                    iconElement.classList.remove('bounce');
                }, 2000);
            }
        } else {
            // Create new marker with appropriate icon
            let iconHtml;
            let iconColor;
            
            // Determine icon based on category or type
            if (place.category) {
                switch (place.category) {
                    case 'restaurants':
                        iconHtml = '<i class="fas fa-utensils"></i>';
                        iconColor = '#FF9800';
                        break;
                    case 'hotels':
                        iconHtml = '<i class="fas fa-hotel"></i>';
                        iconColor = '#9C27B0';
                        break;
                    case 'attractions':
                        iconHtml = '<i class="fas fa-landmark"></i>';
                        iconColor = '#4CAF50';
                        break;
                    default:
                        iconHtml = '<i class="fas fa-map-pin"></i>';
                        iconColor = '#607D8B';
                }
            } else if (place.type) {
                switch (place.type) {
                    case 'restaurant':
                        iconHtml = '<i class="fas fa-utensils"></i>';
                        iconColor = '#FF9800';
                        break;
                    case 'hotel':
                        iconHtml = '<i class="fas fa-hotel"></i>';
                        iconColor = '#9C27B0';
                        break;
                    case 'attraction':
                        iconHtml = '<i class="fas fa-landmark"></i>';
                        iconColor = '#4CAF50';
                        break;
                    default:
                        iconHtml = '<i class="fas fa-map-pin"></i>';
                        iconColor = '#607D8B';
                }
            } else {
                iconHtml = '<i class="fas fa-map-pin"></i>';
                iconColor = '#607D8B';
            }
            
            const icon = L.divIcon({
                className: 'place-marker-icon',
                html: `<div class="place-icon bounce" style="background-color: ${iconColor}" data-id="${place.id}">${iconHtml}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });
            
            const marker = L.marker(placeLatLng, {
                icon: icon,
                title: place.name
            }).addTo(map);
            
            // Create popup content
            const popupContent = `
                <div class="place-popup">
                    <h3>${place.name}</h3>
                    <p>${place.description || 'No description available'}</p>
                    ${place.distance ? `<p class="place-distance">${place.distance}</p>` : ''}
                    <button class="popup-save-btn" onclick="saveThisPlace('${place.id}')">
                        <i class="fas fa-bookmark"></i> Save Place
                    </button>
                </div>
            `;
            
            // Add popup with info
            const popup = L.popup({
                closeButton: true,
                autoClose: true,
                className: 'place-popup-container'
            }).setContent(popupContent);
            
            marker.bindPopup(popup).openPopup();
            
            // Stop bounce animation after 2 seconds
            setTimeout(() => {
                const iconElement = document.querySelector(`.place-icon[data-id="${place.id}"]`);
                if (iconElement) {
                    iconElement.classList.remove('bounce');
                }
            }, 2000);
            
            // Store reference to marker
            placeMarkers.push({
                id: place.id,
                marker: marker,
                place: place
            });
        }
        
        console.log(`Centered map on place: ${place.name}`);
        
    } catch (error) {
        console.error('Error centering map on place:', error);
        window.appFunctions.showToast('Error showing place on map', 'error');
    }
}

// Handle map resize when window changes
function handleMapResize() {
    if (map) {
        map.invalidateSize();
    }
}

// Add window resize handler
window.addEventListener('resize', handleMapResize);

// Make functions available to other scripts
window.mapFunctions = {
    updateMapWithLocation,
    addPlacesToMap,
    centerMapOnPlace,
    handleMapResize
};

// Add CSS for animations
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-20px);
            }
            60% {
                transform: translateY(-10px);
            }
        }
        
        .place-icon.bounce {
            animation: bounce 1s ease infinite;
        }
    `;
    document.head.appendChild(style);
});