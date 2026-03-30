const express = require('express');
const cors = require('cors');
const path = require('path');
const { getAnalytics } = require('./analytics_engine');
const generateCSV = require('./data_generator');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize data if not exists
const csvPath = path.join(__dirname, 'hospital_data.csv');
const fs = require('fs');
if (!fs.existsSync(csvPath)) {
    console.log('Generating initial hospital data...');
    generateCSV();
}

app.get('/api/analytics', async (req, res) => {
    try {
        const data = await getAnalytics();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// For prediction specific endpoint
app.get('/api/predictions', async (req, res) => {
    try {
        const data = await getAnalytics();
        res.json(data.charts.predictions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
