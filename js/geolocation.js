// Update the fetchNearbyPlaces and updateRecommendations functions in geolocation.js

// Fetch nearby places using the user's location
function fetchNearbyPlaces(location) {
    // Use Background Tasks API to handle the data processing
    scheduleBackgroundTask(() => {
        // Simulate network delay
        setTimeout(() => {
            const pointsOfInterestContainer = document.getElementById('points-of-interest');
            if (!pointsOfInterestContainer) return;
            
            pointsOfInterestContainer.innerHTML = ''; // Clear loading indicator
            
            // Mock data for nearby places with more realistic data
            const mockPlaces = [
                {
                    id: 'poi-1',
                    name: 'Central Park',
                    type: 'attraction',
                    distance: '0.5 km',
                    description: 'Beautiful urban park with walking paths and open spaces.',
                    image: 'https://source.unsplash.com/random/300x200/?park'
                },
                {
                    id: 'poi-2',
                    name: 'Cafe Delight',
                    type: 'restaurant',
                    distance: '0.7 km',
                    description: 'Cozy cafe with excellent coffee and pastries.',
                    image: 'https://source.unsplash.com/random/300x200/?cafe'
                },
                {
                    id: 'poi-3',
                    name: 'City Museum',
                    type: 'attraction',
                    distance: '1.2 km',
                    description: 'Historical museum featuring local artifacts and exhibitions.',
                    image: 'https://source.unsplash.com/random/300x200/?museum'
                },
                {
                    id: 'poi-4',
                    name: 'Grand Hotel',
                    type: 'hotel',
                    distance: '1.5 km',
                    description: 'Luxury hotel with excellent amenities and city views.',
                    image: 'https://source.unsplash.com/random/300x200/?hotel'
                },
                {
                    id: 'poi-5',
                    name: 'Italian Restaurant',
                    type: 'restaurant',
                    distance: '0.9 km',
                    description: 'Authentic Italian cuisine with homemade pasta.',
                    image: 'https://source.unsplash.com/random/300x200/?italian+food'
                },
                {
                    id: 'poi-6',
                    name: 'City Library',
                    type: 'attraction',
                    distance: '1.0 km',
                    description: 'Historic library with extensive book collection and quiet reading areas.',
                    image: 'https://source.unsplash.com/random/300x200/?library'
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
                
                // Add place location for saving functionality
                place.location = {
                    latitude: location.latitude + (Math.random() * 0.01 - 0.005),
                    longitude: location.longitude + (Math.random() * 0.01 - 0.005)
                };
                
                poiElement.innerHTML = `
                    <h3>${place.name}</h3>
                    <p>${place.description}</p>
                    <div class="poi-meta">
                        <span class="poi-type" data-type="${place.type}">${place.type}</span>
                        <span class="poi-distance">${place.distance}</span>
                    </div>
                    <div class="poi-actions">
                        <button class="btn secondary view-on-map-btn">View on Map</button>
                        <button class="btn primary save-poi-btn">Save for Later</button>
                    </div>
                `;
                
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
            if (!recommendationsContainer) return;
            
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
            if (!template) return;
            
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
        }, 1000);
    });
}