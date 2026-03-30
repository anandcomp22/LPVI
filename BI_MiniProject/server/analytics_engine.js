const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const moment = require('moment');

const csvPath = path.join(__dirname, 'hospital_data.csv');

async function getAnalytics() {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                const analytics = processData(results);
                resolve(analytics);
            })
            .on('error', (err) => reject(err));
    });
}

function processData(data) {
    const summary = {
        totalPatients: data.length,
        totalRevenue: 0,
        avgWaitingTime: 0,
        peakHour: '',
    };

    const patientInflow = {};
    const doctorPerformance = {};
    const revenueOverTime = {};
    const diseaseDistribution = {};
    const hourlyDistribution = Array(24).fill(0);

    data.forEach(row => {
        const revenue = parseFloat(row.revenue);
        const waitingTime = parseInt(row.waiting_time);
        const date = row.date;
        const hour = parseInt(row.time.split(':')[0]);
        const dept = row.department;
        const doctor = row.doctor;
        const diagnosis = row.diagnosis;

        summary.totalRevenue += revenue;
        summary.avgWaitingTime += waitingTime;
        hourlyDistribution[hour]++;

        // Patient Inflow (Daily)
        patientInflow[date] = (patientInflow[date] || 0) + 1;

        // Doctor Performance
        if (!doctorPerformance[doctor]) {
            doctorPerformance[doctor] = { patients: 0, revenue: 0, dept };
        }
        doctorPerformance[doctor].patients++;
        doctorPerformance[doctor].revenue += revenue;

        // Revenue Over Time
        revenueOverTime[date] = (revenueOverTime[date] || 0) + revenue;

        // Disease Distribution
        diseaseDistribution[diagnosis] = (diseaseDistribution[diagnosis] || 0) + 1;
    });

    summary.avgWaitingTime = Math.round(summary.avgWaitingTime / data.length);
    const peakHourIdx = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
    summary.peakHour = `${peakHourIdx}:00 - ${peakHourIdx + 1}:00`;

    // Format for charts
    const inflowChart = Object.keys(patientInflow).sort().map(date => ({
        date,
        count: patientInflow[date]
    }));

    const doctorChart = Object.keys(doctorPerformance).map(doc => ({
        name: doc,
        patients: doctorPerformance[doc].patients,
        revenue: doctorPerformance[doc].revenue,
        dept: doctorPerformance[doc].dept
    })).sort((a, b) => b.patients - a.patients).slice(0, 8);

    const revenueChart = Object.keys(revenueOverTime).sort().map(date => ({
        date,
        revenue: revenueOverTime[date]
    }));

    const diseaseChart = Object.keys(diseaseDistribution).map(diag => ({
        name: diag,
        value: diseaseDistribution[diag]
    })).sort((a, b) => b.value - a.value).slice(0, 6);

    // Prediction (Simple Moving Average for next 7 days)
    const last7DaysInflow = inflowChart.slice(-7).map(d => d.count);
    const avgInflow = last7DaysInflow.reduce((a, b) => a + b, 0) / (last7DaysInflow.length || 1);
    
    const predictions = [];
    let lastDate = moment(inflowChart[inflowChart.length - 1]?.date || moment());
    for(let i=1; i<=7; i++) {
        predictions.push({
            date: lastDate.add(1, 'days').format('YYYY-MM-DD'),
            predictedCount: Math.round(avgInflow + (Math.random() * 10 - 5)) // Add some jitter
        });
    }

    return {
        summary,
        charts: {
            inflow: inflowChart,
            doctors: doctorChart,
            revenue: revenueChart,
            diseases: diseaseChart,
            predictions: predictions
        }
    };
}

module.exports = { getAnalytics };
