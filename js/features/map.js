/**
 * Map Feature
 * Handles map initialization and functionality
 * Last updated: 2025-07-16
 */

let map; // Global map reference
let markersLayer; // Layer for all markers
let isSidebarOpen = false; // Track sidebar state

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map if map element exists
    const mapElement = document.getElementById('map-element');
    if (mapElement) {
        initializeMap();
    }
    
    // Setup map controls
    setupMapControls();
});

// Initialize Leaflet map
function initializeMap() {
    // Create map instance
    map = L.map('map-element', {
        center: [40.7128, -74.0060], // Default to NYC
        zoom: 13,
        zoomControl: true,
        attributionControl: true
    });
    
    // Add tile layer based on theme
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        // Dark theme
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19
        }).addTo(map);
    } else {
        // Light theme
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
    }
    
    // Create marker layer group
    markersLayer = L.layerGroup().addTo(map);
    
    // Set global map reference
    window.map = map;
    
    // Setup map events
    map.on('click', onMapClick);
    map.on('moveend', onMapMoveEnd);
}

// Setup map controls
function setupMapControls() {
    // Find Me button
    const findMeBtn = document.getElementById('find-me');
    if (findMeBtn) {
        findMeBtn.addEventListener('click', function() {
            locateUser();
        });
    }
    
    // Show POIs button
    const showPoisBtn = document.getElementById('show-pois');
    if (showPoisBtn) {
        showPoisBtn.addEventListener('click', function() {
            togglePointsOfInterest();
        });
    }
}

// Handle map click
function onMapClick(e) {
    console.log("Map clicked at: " + e.latlng.toString());
}

// Handle map moveend event
function onMapMoveEnd(e) {
    // Could load POIs for new area, etc.
}

// Locate user
function locateUser() {
    const findMeBtn = document.getElementById('find-me');
    
    // Show loading state
    if (findMeBtn) {
        findMeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
        findMeBtn.disabled = true;
    }
    
    // Check if geolocation is available
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            // Success callback
            function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                
                // Center map on user location
                centerMap(latitude, longitude);
                
                // Add user marker
                addUserMarker(latitude, longitude);
                
                // Reset button
                if (findMeBtn) {
                    findMeBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Locate Me';
                    findMeBtn.disabled = false;
                }
                
                // Show success toast
                if (window.showToast) {
                    window.showToast('Location updated successfully!', 'success');
                }
                
                // Load nearby POIs if available
                if (window.loadNearbyRecommendations) {
                    window.loadNearbyRecommendations(latitude, longitude);
                }
            },
            // Error callback
            function(error) {
                console.error("Geolocation error:", error);
                
                // Reset button
                if (findMeBtn) {
                    findMeBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Locate Me';
                    findMeBtn.disabled = false;
                }
                
                // Show error toast
                if (window.showToast) {
                    let message = 'Unable to retrieve your location.';
                    
                    if (error.code === 1) {
                        message = 'Location access denied. Please enable location services.';
                    } else if (error.code === 2) {
                        message = 'Location unavailable. Please try again later.';
                    } else if (error.code === 3) {
                        message = 'Location request timed out. Please try again.';
                    }
                    
                    window.showToast(message, 'error');
                }
            },
            // Options
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        // Reset button
        if (findMeBtn) {
            findMeBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Locate Me';
            findMeBtn.disabled = false;
        }
        
        // Show error toast
        if (window.showToast) {
            window.showToast('Geolocation is not supported by your browser.', 'error');
        }
    }
}

// Center map on coordinates
function centerMap(latitude, longitude, zoom = 15) {
    if (map) {
        map.setView([latitude, longitude], zoom);
    }
}

// Add user marker to map
function addUserMarker(latitude, longitude) {
    if (!map || !markersLayer) return;
    
    // Clear existing user marker
    markersLayer.eachLayer(function(layer) {
        if (layer.options && layer.options.isUserMarker) {
            markersLayer.removeLayer(layer);
        }
    });
    
    // Create user marker with pulse effect
    const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<div class="user-marker-icon"><i class="fas fa-user"></i></div><div class="pulse-ring"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    
    const userMarker = L.marker([latitude, longitude], {
        icon: userIcon,
        zIndexOffset: 1000,
        isUserMarker: true
    }).addTo(markersLayer);
    
    userMarker.bindPopup("You are here").openPopup();
}

// Add points of interest to map
function addPointsOfInterest(pois) {
    if (!map || !markersLayer || !pois) return;
    
    // Clear existing POI markers
    markersLayer.eachLayer(function(layer) {
        if (layer.options && layer.options.isPOI) {
            markersLayer.removeLayer(layer);
        }
    });
    
    // Add new POI markers
    pois.forEach(poi => {
        if (poi.location && poi.location.latitude && poi.location.longitude) {
            // Create marker icon based on category
            const categoryIcon = getCategoryIcon(poi.category);
            
            const marker = L.marker([poi.location.latitude, poi.location.longitude], {
                icon: categoryIcon,
                isPOI: true
            }).addTo(markersLayer);
            
            // Create popup content
            const popupContent = `
                <div class="map-popup">
                    <div class="map-popup-header">
                        <h3>${poi.name}</h3>
                    </div>
                    <div class="map-popup-content">
                        <p>${poi.description ? poi.description.substring(0, 100) + '...' : 'No description available'}</p>
                    </div>
                    <div class="map-popup-actions">
                        <button class="btn primary view-details-btn">Details</button>
                    </div>
                </div>
            `;
            
            const popup = L.popup({
                className: 'custom-popup',
                closeButton: true,
                autoClose: true,
                closeOnEscapeKey: true
            }).setContent(popupContent);
            
            marker.bindPopup(popup);
            
            // Add event listener to popup
            marker.on('popupopen', function(e) {
                const detailsBtn = document.querySelector('.view-details-btn');
                if (detailsBtn) {
                    detailsBtn.addEventListener('click', function() {
                        if (window.showPlaceDetails) {
                            window.showPlaceDetails(poi);
                        }
                    });
                }
            });
        }
    });
}

// Toggle points of interest visibility
function togglePointsOfInterest() {
    const mapSidebar = document.getElementById('map-sidebar');
    const showPoisBtn = document.getElementById('show-pois');
    
    if (mapSidebar) {
        isSidebarOpen = !isSidebarOpen;
        
        if (isSidebarOpen) {
            mapSidebar.classList.add('active');
            if (showPoisBtn) {
                showPoisBtn.innerHTML = '<i class="fas fa-times"></i> Hide Points of Interest';
            }
            
            // Load POIs if data is available
            if (window.mockRecommendations) {
                populatePoiList(window.mockRecommendations);
            }
        } else {
            mapSidebar.classList.remove('active');
            if (showPoisBtn) {
                showPoisBtn.innerHTML = '<i class="fas fa-map-pin"></i> Show Points of Interest';
            }
        }
    }
}

// Populate POI list in sidebar
function populatePoiList(pois) {
    const poiItems = document.getElementById('poi-items');
    if (!poiItems) return;
    
    // Clear existing items
    poiItems.innerHTML = '';
    
    if (pois && pois.length > 0) {
        // Get template
        const template = document.getElementById('poi-template');
        if (template) {
            pois.forEach(poi => {
                const poiElement = document.importNode(template.content, true);
                
                // Set POI data
                poiElement.querySelector('.poi-name').textContent = poi.name;
                
                const poiDesc = poiElement.querySelector('.poi-description');
                if (poiDesc) {
                    poiDesc.textContent = poi.description 
                        ? (poi.description.length > 80 ? poi.description.substring(0, 80) + '...' : poi.description) 
                        : 'No description available';
                }
                
                const poiType = poiElement.querySelector('.poi-type');
                if (poiType) {
                    poiType.textContent = poi.category || poi.type || 'Place';
                }
                
                const poiDistance = poiElement.querySelector('.poi-distance');
                if (poiDistance && poi.distance) {
                    poiDistance.textContent = formatDistance(poi.distance);
                }
                
                // Set button actions
                const viewOnMapBtn = poiElement.querySelector('.view-on-map-btn');
                if (viewOnMapBtn && poi.location) {
                    viewOnMapBtn.addEventListener('click', () => {
                        centerMapOnPlace(poi);
                    });
                }
                
                const saveBtn = poiElement.querySelector('.save-poi-btn');
                if (saveBtn) {
                    saveBtn.addEventListener('click', () => {
                        if (window.appFunctions && window.appFunctions.savePlace) {
                            window.appFunctions.savePlace(poi);
                        }
                    });
                }
                
                // Add to container
                poiItems.appendChild(poiElement);
            });
        } else {
            // No template, create basic list
            pois.forEach(poi => {
                const item = document.createElement('div');
                item.className = 'poi-item';
                item.innerHTML = `
                    <h3>${poi.name}</h3>
                    <p>${poi.description ? poi.description.substring(0, 80) + '...' : 'No description available'}</p>
                `;
                poiItems.appendChild(item);
            });
        }
    } else {
        poiItems.innerHTML = `
            <div class="no-data">
                <i class="fas fa-map-marker-slash"></i>
                <p>No points of interest found nearby.</p>
            </div>
        `;
    }
}

// Center map on place
function centerMapOnPlace(place) {
    if (!map || !place || !place.location) return;
    
    // Center map on place
    centerMap(place.location.latitude, place.location.longitude);
    
    // Find and open the marker's popup
    markersLayer.eachLayer(function(layer) {
        if (layer.options && layer.options.isPOI) {
            const markerLatLng = layer.getLatLng();
            const placeLatLng = L.latLng(place.location.latitude, place.location.longitude);
            
            if (markerLatLng.distanceTo(placeLatLng) < 10) {
                layer.openPopup();
            }
        }
    });
}

// Get icon for category
function getCategoryIcon(category) {
    let iconClass = 'fa-map-marker-alt';
    let iconColor = '#3498db'; // Default blue
    
    if (!category) {
        category = 'default';
    }
    
    category = category.toLowerCase();
    
    if (category.includes('restaurant') || category.includes('food') || category.includes('cafe')) {
        iconClass = 'fa-utensils';
        iconColor = '#e74c3c'; // Red
    } else if (category.includes('hotel') || category.includes('lodging') || category.includes('accommodation')) {
        iconClass = 'fa-bed';
        iconColor = '#9b59b6'; // Purple
    } else if (category.includes('attraction') || category.includes('landmark') || category.includes('monument')) {
        iconClass = 'fa-monument';
        iconColor = '#f39c12'; // Orange
    } else if (category.includes('shopping') || category.includes('store') || category.includes('mall')) {
        iconClass = 'fa-shopping-bag';
        iconColor = '#2ecc71'; // Green
    } else if (category.includes('entertainment') || category.includes('theater') || category.includes('cinema')) {
        iconClass = 'fa-film';
        iconColor = '#e91e63'; // Pink
    } else if (category.includes('park') || category.includes('garden') || category.includes('nature')) {
        iconClass = 'fa-tree';
        iconColor = '#27ae60'; // Dark green
    }
    
    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-icon" style="background-color: ${iconColor}"><i class="fas ${iconClass}"></i></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });
}

// Format distance for display
function formatDistance(distance) {
    if (typeof distance !== 'number') return '';
    
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
    } else {
        return `${distance.toFixed(1)}km`;
    }
}

// Export functions for other modules
window.mapFunctions = {
    centerMap,
    centerMapOnPlace,
    addPointsOfInterest,
    togglePointsOfInterest
};