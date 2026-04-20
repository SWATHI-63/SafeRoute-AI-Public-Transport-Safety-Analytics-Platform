const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Database for the prototype (Tamil Nadu focus)
let unsafeZones = [
    { id: 1, coords: [13.0827, 80.2707], radius: 300, risk: 'High', reports: 5, type: 'Poor Lighting', city: 'Chennai' },
    { id: 2, coords: [11.0168, 76.9558], radius: 250, risk: 'Medium', reports: 2, type: 'Isolated Area', city: 'Coimbatore' },
    { id: 3, coords: [9.9252, 78.1198], radius: 400, risk: 'High', reports: 8, type: 'Previous Incidents', city: 'Madurai' }
];

// GET: Fetch all unsafe zones to display on the map heatmaps
app.get('/api/incidents', (req, res) => {
    res.json(unsafeZones);
});

// GET: Fetch real route using OpenStreetMap/OSRM
app.get('/api/route', async (req, res) => {
    const { source, destination } = req.query;
    
    if (!source || !destination) {
        return res.status(400).json({ error: 'Source and destination are required' });
    }

    try {
        // Find coordinates for source
        const srcRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(source + ', Tamil Nadu')}&format=json&limit=1`);
        const srcData = await srcRes.json();
        
        // Find coordinates for destination
        const destRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination + ', Tamil Nadu')}&format=json&limit=1`);
        const destData = await destRes.json();

        if (!srcData.length || !destData.length) {
            return res.status(404).json({ error: 'Could not find requested locations.' });
        }

        const srcLat = parseFloat(srcData[0].lat);
        const srcLon = parseFloat(srcData[0].lon);
        const destLat = parseFloat(destData[0].lat);
        const destLon = parseFloat(destData[0].lon);

        // Get driving route using OSRM
        const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${srcLon},${srcLat};${destLon},${destLat}?overview=full&geometries=geojson`);
        const routeData = await osrmRes.json();

        if (routeData.code !== 'Ok') {
            return res.status(400).json({ error: 'Could not calculate route' });
        }

        // OSRM returns coordinates as [longitude, latitude], Leaflet needs [latitude, longitude]
        const waypoints = routeData.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);

        res.json({
            origin: source,
            destination: destination,
            waypoints: waypoints,
            distance: (routeData.routes[0].distance / 1000).toFixed(1) + ' km',
            estimatedTime: Math.round(routeData.routes[0].duration / 60) + ' mins',
        });

    } catch (error) {
        console.error('Error fetching route:', error);
        res.status(500).json({ error: 'Internal server error while resolving route.' });
    }
});

// POST: Add a new user-reported incident
app.post('/api/incidents', (req, res) => {
    const { type, location } = req.body;
    
    if (!type) {
        return res.status(400).json({ error: 'Issue type is required' });
    }

    // For the prototype, we offset it slightly to roughly simulate exactly where a user might be without a real GPS
    const baseCoords = location || [13.0827, 80.2707]; // Default to Chennai
    const randomizedCoords = [
        baseCoords[0] + (Math.random() - 0.5) * 0.01,
        baseCoords[1] + (Math.random() - 0.5) * 0.01
    ];

    const newIncident = {
        id: unsafeZones.length + 1,
        coords: randomizedCoords,
        radius: 200,
        risk: 'Medium', // Default to medium until reviewed
        reports: 1,
        type: type
    };

    unsafeZones.push(newIncident);
    
    // Simulate slight backend delay to make it feel real
    setTimeout(() => {
        res.status(201).json(newIncident);
    }, 500);
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Backend server is running on http://localhost:${PORT}`);
    });
}
module.exports = app;

