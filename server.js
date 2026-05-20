const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Data storage (max 100 metingen)
let sensorData = [];
const MAX_DATA_POINTS = 100;

// POST - Ontvang data van Pico
app.post('/data', (req, res) => {
    const { distance, unit } = req.body;
    
    if (distance === undefined) {
        return res.status(400).json({ error: 'Distance is required' });
    }
    
    const dataPoint = {
        id: sensorData.length + 1,
        distance: distance,
        unit: unit || 'mm',
        timestamp: new Date().toISOString()
    };
    
    sensorData.push(dataPoint);
    
    // Houd max 100 punten
    if (sensorData.length > MAX_DATA_POINTS) {
        sensorData.shift();
    }
    
    console.log(`✓ Data ontvangen: ${distance}${unit || 'mm'} - ${new Date().toLocaleTimeString()}`);
    res.json({ success: true, message: 'Data ontvangen' });
});

// GET - Haal alle data op
app.get('/api/data', (req, res) => {
    res.json(sensorData);
});

// GET - Statistieken
app.get('/api/stats', (req, res) => {
    if (sensorData.length === 0) {
        return res.json({
            count: 0,
            min: null,
            max: null,
            average: null,
            latest: null
        });
    }
    
    const distances = sensorData.map(d => d.distance);
    const min = Math.min(...distances);
    const max = Math.max(...distances);
    const average = (distances.reduce((a, b) => a + b, 0) / distances.length).toFixed(2);
    
    res.json({
        count: sensorData.length,
        min: min,
        max: max,
        average: parseFloat(average),
        latest: sensorData[sensorData.length - 1]
    });
});

// GET - Laatste meting
app.get('/api/latest', (req, res) => {
    if (sensorData.length === 0) {
        return res.status(404).json({ error: 'Geen data beschikbaar' });
    }
    res.json(sensorData[sensorData.length - 1]);
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server draait op http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`📡 Pico stuurt data naar: http://YOUR_IP:${PORT}/data\n`);
});
