/**
 * Mock Recommendation Data
 * Provides sample data for the application
 * Last updated: 2025-07-16
 */

// Sample recommendation data
const mockRecommendations = [
    {
        id: 'rec1',
        name: 'Central Park',
        description: 'A beautiful urban park in the heart of the city. Perfect for walks, picnics, and outdoor activities.',
        category: 'attraction',
        imageUrl: 'assets/images/placeholder.jpg',
        rating: 4.8,
        location: {
            latitude: 40.7812,
            longitude: -73.9665
        }
    },
    {
        id: 'rec2',
        name: 'The Gourmet Kitchen',
        description: 'Fine dining restaurant with a variety of international cuisines and an extensive wine selection.',
        category: 'restaurant',
        imageUrl: 'assets/images/placeholder.jpg',
        rating: 4.5,
        location: {
            latitude: 40.7580,
            longitude: -73.9855
        }
    },
    {
        id: 'rec3',
        name: 'Metropolitan Museum',
        description: 'One of the largest art museums in the world with extensive collections spanning all periods.',
        category: 'attraction',
        imageUrl: 'assets/images/placeholder.jpg',
        rating: 4.7,
        location: {
            latitude: 40.7794,
            longitude: -73.9632
        }
    },
    {
        id: 'rec4',
        name: 'Grand Central Market',
        description: 'Historic indoor market with various local vendors selling artisan goods and fresh produce.',
        category: 'shopping',
        imageUrl: 'assets/images/placeholder.jpg',
        rating: 4.3,
        location: {
            latitude: 40.7527,
            longitude: -73.9772
        }
    },
    {
        id: 'rec5',
        name: 'Luxury Suites Hotel',
        description: 'Five-star accommodation with luxury amenities, rooftop pool, and stunning city views.',
        category: 'hotel',
        imageUrl: 'assets/images/placeholder.jpg',
        rating: 4.9,
        location: {
            latitude: 40.7614,
            longitude: -73.9776
        }
    },
    {
        id: 'rec6',
        name: 'City Lights Cinema',
        description: 'Modern multiplex showing the latest blockbusters and independent films in a comfortable setting.',
        category: 'entertainment',
        imageUrl: 'assets/images/placeholder.jpg',
        rating: 4.2,
        location: {
            latitude: 40.7648,
            longitude: -73.9808
        }
    },
    {
        id: 'rec7',
        name: 'Riverside Cafe',
        description: 'Cozy cafe with waterfront views, serving specialty coffees, pastries, and light meals.',
        category: 'restaurant',
        imageUrl: 'assets/images/placeholder.jpg',
        rating: 4.4,
        location: {
            latitude: 40.7731,
            longitude: -73.9712
        }
    },
    {
        id: 'rec8',
        name: 'Fashion District Mall',
        description: 'Premier shopping destination featuring high-end retailers, boutiques, and department stores.',
        category: 'shopping',
        imageUrl: 'assets/images/placeholder.jpg',
        rating: 4.1,
        location: {
            latitude: 40.7539,
            longitude: -73.9912
        }
    },
    {
        id: 'rec9',
        name: 'Botanical Gardens',
        description: 'Expansive gardens featuring thousands of plant species, themed sections, and seasonal displays.',
        category: 'attraction',
        imageUrl: 'assets/images/placeholder.jpg',
        rating: 4.6,
        location: {
            latitude: 40.7882,
            longitude: -73.9532
        }
    },
    {
        id: 'rec10',
        name: 'Downtown Bistro',
        description: 'Trendy bistro serving creative dishes made with locally-sourced ingredients in a modern setting.',
        category: 'restaurant',
        imageUrl: 'assets/images/placeholder.jpg',
        rating: 4.3,
        location: {
            latitude: 40.7681,
            longitude: -73.9826
        }
    },
    {
        id: 'rec11',
        name: 'Historic Theater',
        description: 'Beautifully restored theater hosting Broadway shows, concerts, and cultural performances.',
        category: 'entertainment',
        imageUrl: 'assets/images/placeholder.jpg',
        rating: 4.7,
        location: {
            latitude: 40.7590,
            longitude: -73.9845
        }
    },
    {
        id: 'rec12',
        name: 'City View Hotel',
        description: 'Contemporary hotel offering comfortable rooms, a fitness center, and excellent city views.',
        category: 'hotel',
        imageUrl: 'assets/images/placeholder.jpg',
        rating: 4.4,
        location: {
            latitude: 40.7632,
            longitude: -73.9819
        }
    }
];

// Make data available globally
if (typeof window !== 'undefined') {
    window.mockRecommendations = mockRecommendations;
}