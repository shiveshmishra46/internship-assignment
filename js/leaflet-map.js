// Leaflet Map implementation (replacing canvas-map.js)

// Map variables
let map;
let userMarker;
let placeMarkers = [];
let mapReady = false;

// Initialize Leaflet map
function initCanvasMap() {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        return;
    }

    // Create map
    map = L.map('map-element', {
        center: [0, 0], // Default center (will be updated with user location)
        zoom: 15,
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
}

// Update map with user's location
function updateMapWithLocation(location) {
    if (!mapReady || !location || !map) return;
    
    const userLatLng = [location.latitude, location.longitude];
    
    // Set map view to user's location
    map.setView(userLatLng, 15);
    
    // Create/update user marker
    if (userMarker) {
        // Update existing marker
        userMarker.setLatLng(userLatLng);
    } else {
        // Create new marker with accuracy circle
        userMarker = L.marker(userLatLng, {
            icon: createUserIcon(),
            title: 'Your Location'
        }).addTo(map);
        
        // Add accuracy circle if accuracy is available
        if (location.accuracy) {
            L.circle(userLatLng, {
                radius: location.accuracy,
                color: '#4285F4',
                fillColor: '#4285F4',
                fillOpacity: 0.2
            }).addTo(map);
        }
    }
    
    // Show a popup with coordinates
    userMarker.bindPopup(`You are here!<br>Latitude: ${location.latitude.toFixed(5)}<br>Longitude: ${location.longitude.toFixed(5)}`);
}

// Create a custom user location icon
function createUserIcon() {
    return L.divIcon({
        className: 'user-marker-icon',
        html: '<div class="user-marker-pulse"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}

// Add places to the map
function addPlacesToMap(places) {
    if (!mapReady || !map) return;
    
    // Clear existing place markers
    clearPlaceMarkers();
    
    // Get user location for distance calculation
    const userLocation = window.geolocationFunctions?.getUserLocation();
    
    // Add markers for each place
    places.forEach(place => {
        // In a real app, place would have proper coordinates
        // Here we're creating synthetic coordinates near the user's location
        const placeLocation = {
            latitude: userLocation?.latitude + (Math.random() * 0.01 - 0.005) || 0,
            longitude: userLocation?.longitude + (Math.random() * 0.01 - 0.005) || 0
        };
        
        // Associate location with place for future use
        place.location = placeLocation;
        
        const markerLatLng = [placeLocation.latitude, placeLocation.longitude];
        
        // Create icon based on place type
        const icon = createPlaceIcon(place.type);
        
        // Create and add marker
        const marker = L.marker(markerLatLng, {
            icon: icon,
            title: place.name
        }).addTo(map);
        
        // Add popup with info
        marker.bindPopup(`
            <div class="place-popup">
                <h3>${place.name}</h3>
                <p>${place.description}</p>
                <p class="place-distance">${place.distance}</p>
                <button class="popup-save-btn" onclick="window.appFunctions.savePlace(${JSON.stringify(place).replace(/"/g, '&quot;')})">Save Place</button>
            </div>
        `);
        
        // Store reference to marker
        placeMarkers.push({
            id: place.id,
            marker: marker
        });
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

// Create icons for different place types
function createPlaceIcon(type) {
    let color;
    let iconHtml;
    
    switch (type) {
        case 'restaurant':
            color = '#FF9800';
            iconHtml = '🍴';
            break;
        case 'hotel':
            color = '#9C27B0';
            iconHtml = '🏨';
            break;
        case 'attraction':
            color = '#4CAF50';
            iconHtml = '🏛️';
            break;
        default:
            color = '#607D8B';
            iconHtml = '📍';
    }
    
    return L.divIcon({
        className: 'place-marker-icon',
        html: `<div class="place-icon" style="background-color: ${color};">${iconHtml}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
}

// Center map on a specific place
function centerMapOnPlace(place) {
    if (!mapReady || !map || !place.location) return;
    
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
        const icon = createPlaceIcon(place.category);
        
        const marker = L.marker(placeLatLng, {
            icon: icon,
            title: place.name
        }).addTo(map);
        
        // Add popup with info
        marker.bindPopup(`
            <div class="place-popup">
                <h3>${place.name}</h3>
                <p>${place.description}</p>
                <button class="popup-view-details" onclick="window.appFunctions.showPlaceDetails('${place.id}')">View Details</button>
            </div>
        `).openPopup();
        
        // Store reference to marker
        placeMarkers.push({
            id: place.id,
            marker: marker
        });
    }
}

// Make functions available to other scripts
window.mapFunctions = {
    updateMapWithLocation,
    addPlacesToMap,
    centerMapOnPlace
};

// Add CSS for map markers
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .user-marker-icon {
            background: none;
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
            background: none;
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
        }
        
        .place-popup h3 {
            margin-bottom: 5px;
        }
        
        .place-popup p {
            margin-bottom: 10px;
        }
        
        .popup-save-btn, .popup-view-details {
            background-color: #4a6de5;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .place-distance {
            font-size: 0.9em;
            color: #666;
        }
    `;
    
    document.head.appendChild(style);
});