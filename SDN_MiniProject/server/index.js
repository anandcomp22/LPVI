const express = require('express');
const cors = require('cors');
const simulator = require('./traffic_simulator');

const app = express();
const PORT = process.env.PORT || 5001; // Avoiding 5000 since BI dashboard might be running

app.use(cors());
app.use(express.json());

app.get('/api/sdn-metrics', (req, res) => {
    try {
        const data = simulator.getMetrics();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch SDN analytics' });
    }
});

app.listen(PORT, () => {
    console.log(`SDN Mock Controller API running on http://localhost:${PORT}`);
});
