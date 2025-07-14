// Leaflet Map implementation (replacing canvas-map.js)

// Map variables
let map;
let userMarker;
let userAccuracyCircle;
let placeMarkers = [];
let mapReady = false;

// Initialize Leaflet map
function initCanvasMap() {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        return;
    }

    try {
        // Create map
        map = L.map('map-element', {
            center: [0, 0], // Default center (will be updated with user location)
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
        
        // Initial map display (if geolocation is already available)
        const userLocation = window.geolocationFunctions?.getUserLocation();
        if (userLocation) {
            updateMapWithLocation(userLocation);
        } else {
            // Set default view if no location yet
            map.setView([40.7128, -74.0060], 13); // Default to New York City
        }

        // Add CSS for map marker customization
        addMapCustomStyles();

    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Add custom styles for map markers
function addMapCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .user-marker-icon {
            background: none !important;
        }
        
        .user-marker-pulse {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #4285F4;
            border: 2px solid white;
            box-shadow: 0 0 0 rgba(66, 133, 244, 0.4);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4);
            }
            70% {
                box-shadow: 0 0 0 15px rgba(66, 133, 244, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
            }
        }
        
        .place-marker-icon {
            background: none !important;
        }
        
        .place-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            color: white;
            font-size: 16px;
            text-align: center;
            line-height: 32px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    
    document.head.appendChild(style);
}

// Update map with user's location
function updateMapWithLocation(location) {
    if (!mapReady || !location || !map) {
        console.error("Map not ready or location not available");
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
            userMarker.bindPopup("You are here!");
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
    } catch (error) {
        console.error('Error updating map with location:', error);
    }
}

// Add places to the map
function addPlacesToMap(places) {
    if (!mapReady || !map) {
        console.error("Map not ready");
        return;
    }
    
    try {
        // Clear existing place markers
        clearPlaceMarkers();
        
        // Get user location for distance calculation
        const userLocation = window.geolocationFunctions?.getUserLocation();
        
        if (!userLocation) {
            console.warn("User location not available for place markers");
            return;
        }
        
        // Add markers for each place
        places.forEach(place => {
            // In a real app, place would have proper coordinates
            // Here we're creating synthetic coordinates near the user's location
            const placeLocation = {
                latitude: userLocation.latitude + (Math.random() * 0.01 - 0.005),
                longitude: userLocation.longitude + (Math.random() * 0.01 - 0.005)
            };
            
            // Associate location with place for future use
            place.location = placeLocation;
            
            // Generate a placeholder image URL for this place
            place.image = `https://source.unsplash.com/random/300x200/?${place.type}`;
            
            const markerLatLng = [placeLocation.latitude, placeLocation.longitude];
            
            // Create icon based on place type
            let icon, iconHtml;
            
            switch (place.type) {
                case 'restaurant':
                    iconHtml = '🍴';
                    icon = createPlaceIcon('#FF9800', iconHtml);
                    break;
                case 'hotel':
                    iconHtml = '🏨';
                    icon = createPlaceIcon('#9C27B0', iconHtml);
                    break;
                case 'attraction':
                    iconHtml = '🏛️';
                    icon = createPlaceIcon('#4CAF50', iconHtml);
                    break;
                default:
                    iconHtml = '📍';
                    icon = createPlaceIcon('#607D8B', iconHtml);
            }
            
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
                    <button class="popup-save-btn" onclick="saveThisPlace(${JSON.stringify(place).replace(/"/g, '&quot;')})">Save Place</button>
                </div>
            `;
            
            // Add popup with info
            const popup = L.popup({
                closeButton: true,
                autoClose: true,
                className: 'place-popup-container'
            }).setContent(popupContent);
            
            marker.bindPopup(popup);
            
            // Store reference to marker
            placeMarkers.push({
                id: place.id,
                marker: marker,
                place: place
            });
        });
        
        // Add global save function that the popup can call
        window.saveThisPlace = function(place) {
            if (window.appFunctions && window.appFunctions.savePlace) {
                window.appFunctions.savePlace(place);
            }
        };
    } catch (error) {
        console.error('Error adding places to map:', error);
    }
}

// Create custom icon for different place types
function createPlaceIcon(color, iconHtml) {
    return L.divIcon({
        className: 'place-marker-icon',
        html: `<div class="place-icon" style="background-color: ${color};">${iconHtml}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
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
        console.error("Map not ready or place has no location", place);
        return;
    }
    
    try {
        const placeLatLng = [place.location.latitude, place.location.longitude];
        
        // Set map view to place location
        map.setView(placeLatLng, 17);
        
        // Find existing marker or create one
        const existingMarker = placeMarkers.find(item => item.id === place.id);
        
        if (existingMarker) {
            // Open popup for existing marker
            existingMarker.marker.openPopup();
        } else {
            // Create new highlighted marker
            let icon, iconHtml;
            
            switch (place.category) {
                case 'restaurants':
                    iconHtml = '🍴';
                    icon = createPlaceIcon('#FF9800', iconHtml);
                    break;
                case 'attractions':
                    iconHtml = '🏛️';
                    icon = createPlaceIcon('#4CAF50', iconHtml);
                    break;
                case 'hotels':
                    iconHtml = '🏨';
                    icon = createPlaceIcon('#9C27B0', iconHtml);
                    break;
                default:
                    iconHtml = '📍';
                    icon = createPlaceIcon('#607D8B', iconHtml);
            }
            
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
                    <button class="popup-save-btn" onclick="saveThisPlace(${JSON.stringify(place).replace(/"/g, '&quot;')})">Save Place</button>
                </div>
            `;
            
            // Add popup with info
            const popup = L.popup({
                closeButton: true,
                autoClose: true,
                className: 'place-popup-container'
            }).setContent(popupContent);
            
            marker.bindPopup(popup).openPopup();
            
            // Store reference to marker
            placeMarkers.push({
                id: place.id,
                marker: marker,
                place: place
            });
        }
    } catch (error) {
        console.error('Error centering map on place:', error);
    }
}

// Make functions available to other scripts
window.mapFunctions = {
    updateMapWithLocation,
    addPlacesToMap,
    centerMapOnPlace
};