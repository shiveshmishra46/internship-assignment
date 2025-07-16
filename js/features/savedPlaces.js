/**
 * Saved Places Feature
 * Handles saving, loading, and displaying saved places
 * Last updated: 2025-07-16
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initial update of saved places UI
    updateSavedPlacesUI();
});

// Save place for later
function savePlace(placeData) {
    console.log("Saving place:", placeData);
    
    if (!placeData || !placeData.id || !placeData.name) {
        console.error("Invalid place data:", placeData);
        if (window.showToast) {
            window.showToast('Error: Could not save place due to missing data', 'error');
        }
        return false;
    }
    
    // Initialize savedPlaces if not available
    if (!window.appState) {
        window.appState = {};
    }
    
    if (!window.appState.savedPlaces) {
        window.appState.savedPlaces = [];
    }
    
    // Check if place already saved
    const isAlreadySaved = window.appState.savedPlaces.some(place => place.id === placeData.id);
    
    if (!isAlreadySaved) {
        // Make sure the place has an image (use placeholder if missing)
        if (!placeData.image && !placeData.imageUrl) {
            placeData.image = 'assets/images/placeholder.jpg';
        }
        
        // Add to saved places
        window.appState.savedPlaces.push(placeData);
        
        // Update localStorage
        savePlacesToStorage();
        
        // Show success notification
        if (window.showToast) {
            window.showToast(`${placeData.name} saved successfully!`, 'success');
        }
        
        // Update saved places UI
        updateSavedPlacesUI();
        
        return true;
    } else {
        // Show already saved notification
        if (window.showToast) {
            window.showToast(`${placeData.name} is already saved.`, 'info');
        }
        
        return false;
    }
}

// Save places to localStorage
function savePlacesToStorage() {
    try {
        if (window.appState && window.appState.savedPlaces) {
            localStorage.setItem('savedPlaces', JSON.stringify(window.appState.savedPlaces));
        }
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        
        if (window.showToast) {
            window.showToast('Error saving your places. Storage may be full.', 'error');
        }
    }
}

// Remove saved place
function removePlace(placeId) {
    if (!window.appState || !window.appState.savedPlaces) return;
    
    // Find the place name before removing
    const placeToRemove = window.appState.savedPlaces.find(place => place.id === placeId);
    const placeName = placeToRemove ? placeToRemove.name : 'Place';
    
    // Filter out the place to remove
    window.appState.savedPlaces = window.appState.savedPlaces.filter(place => place.id !== placeId);
    
    // Update localStorage
    savePlacesToStorage();
    
    // Show notification
    if (window.showToast) {
        window.showToast(`${placeName} removed from saved places.`, 'success');
    }
    
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
    
    // Get saved places
    const savedPlaces = window.appState && window.appState.savedPlaces ? window.appState.savedPlaces : [];
    
    // Clear container
    savedPlacesContainer.innerHTML = '';
    
    if (savedPlaces.length === 0) {
        savedPlacesContainer.innerHTML = `
            <div class="no-data">
                <i class="fas fa-bookmark"></i>
                <p>No saved places yet. Explore and save places you like!</p>
                <button class="btn primary" onclick="window.appFunctions.navigateToSection('map')">
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
        
        // Create basic saved places display if template not available
        savedPlaces.forEach(place => {
            const card = document.createElement('div');
            card.className = 'saved-place-card';
            card.innerHTML = `
                <div class="saved-image">
                    <img src="${place.image || place.imageUrl || 'assets/images/placeholder.jpg'}" 
                         alt="${place.name}" loading="lazy">
                </div>
                <div class="saved-place-info">
                    <h3>${place.name}</h3>
                    <p>${place.description || 'No description available'}</p>
                    <div class="place-actions">
                        <button class="btn view-on-map"><i class="fas fa-map-marker-alt"></i> View on Map</button>
                        <button class="btn remove-place"><i class="fas fa-trash"></i> Remove</button>
                    </div>
                </div>
            `;
            savedPlacesContainer.appendChild(card);
        });
        
        return;
    }
    
    // Create and append saved place cards
    savedPlaces.forEach(place => {
        const card = document.importNode(template.content, true);
        
        // Set place data
        card.querySelector('.place-name').textContent = place.name;
        card.querySelector('.place-description').textContent = place.description || 'No description available';
        
        // Set badge text based on category or type
        const badge = card.querySelector('.card-badge');
        if (badge) {
            if (place.category) {
                badge.textContent = place.category;
                badge.style.backgroundColor = getCategoryColor(place.category);
            } else if (place.type) {
                badge.textContent = place.type;
                badge.style.backgroundColor = getCategoryColor(place.type);
            } else {
                badge.style.display = 'none';
            }
        }
        
        // Handle image
        const imgElement = card.querySelector('img');
        if (imgElement) {
            imgElement.src = place.image || place.imageUrl || 'assets/images/placeholder.jpg';
            imgElement.alt = place.name;
        }
        
        // Add place ID to card for reference
        const cardElement = card.querySelector('.saved-place-card');
        if (cardElement) {
            cardElement.dataset.id = place.id;
            
            // Make entire card clickable to show details
            cardElement.addEventListener('click', (e) => {
                // Don't trigger if clicked on buttons
                if (!e.target.closest('.btn')) {
                    if (window.showPlaceDetails) {
                        window.showPlaceDetails(place);
                    }
                }
            });
        }
        
        // Add event listeners for buttons
        const viewOnMapBtn = card.querySelector('.view-on-map');
        if (viewOnMapBtn) {
            viewOnMapBtn.addEventListener('click', () => {
                if (window.appFunctions && window.appFunctions.navigateToSection) {
                    window.appFunctions.navigateToSection('map');
                }
                
                if (window.mapFunctions && window.mapFunctions.centerMapOnPlace) {
                    setTimeout(() => {
                        window.mapFunctions.centerMapOnPlace(place);
                    }, 300);
                }
            });
        }
        
        const removeBtn = card.querySelector('.remove-place');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                removePlace(place.id);
            });
        }
        
        // Append to container
        savedPlacesContainer.appendChild(card);
    });
}

// Get color for category
function getCategoryColor(category) {
    if (!category) return '#607D8B'; // Default gray
    
    const lowercaseCategory = category.toLowerCase();
    
    if (lowercaseCategory.includes('restaurant') || lowercaseCategory.includes('food') || lowercaseCategory.includes('dining')) {
        return '#FF9800'; // Orange
    } else if (lowercaseCategory.includes('hotel') || lowercaseCategory.includes('lodging') || lowercaseCategory.includes('stay')) {
        return '#9C27B0'; // Purple
    } else if (lowercaseCategory.includes('attraction') || lowercaseCategory.includes('landmark') || lowercaseCategory.includes('sight')) {
        return '#4CAF50'; // Green
    } else if (lowercaseCategory.includes('shopping') || lowercaseCategory.includes('store') || lowercaseCategory.includes('mall')) {
        return '#2196F3'; // Blue
    } else if (lowercaseCategory.includes('entertainment') || lowercaseCategory.includes('theater') || lowercaseCategory.includes('cinema')) {
        return '#E91E63'; // Pink
    } else {
        return '#607D8B'; // Gray as fallback
    }
}

// Export functions for other modules
if (typeof window !== 'undefined') {
    window.savePlace = savePlace;
    window.removePlace = removePlace;
    window.updateSavedPlacesUI = updateSavedPlacesUI;
    window.getCategoryColor = getCategoryColor;
}