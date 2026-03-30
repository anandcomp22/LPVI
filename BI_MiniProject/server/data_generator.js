const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'hospital_data.csv');

const departments = ['Emergency', 'Cardiology', 'Pediatrics', 'General', 'Orthopedics', 'Neurology'];
const doctors = {
    'Emergency': ['Dr. Smith', 'Dr. Jones'],
    'Cardiology': ['Dr. Brown', 'Dr. Davis'],
    'Pediatrics': ['Dr. Wilson', 'Dr. Taylor'],
    'General': ['Dr. Moore', 'Dr. Anderson'],
    'Orthopedics': ['Dr. Thomas', 'Dr. Jackson'],
    'Neurology': ['Dr. White', 'Dr. Harris']
};
const diagnoses = {
    'Emergency': ['Trauma', 'Chest Pain', 'High Fever', 'Injury'],
    'Cardiology': ['Hypertension', 'Arrhythmia', 'Heart Failure'],
    'Pediatrics': ['Flu', 'Cold', 'Vaccination', 'Checkup'],
    'General': ['Fever', 'Headache', 'Physical Exam'],
    'Orthopedics': ['Fracture', 'Sprain', 'Back Pain'],
    'Neurology': ['Migraine', 'Seizure', 'Dizziness']
};

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateCSV() {
    const records = [];
    const header = 'id,date,time,doctor,department,diagnosis,revenue,waiting_time\n';
    records.push(header);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    const endDate = new Date();

    for (let i = 1; i <= 1000; i++) {
        const dateObj = getRandomDate(startDate, endDate);
        const date = dateObj.toISOString().split('T')[0];
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        const dept = departments[Math.floor(Math.random() * departments.length)];
        const docList = doctors[dept];
        const doctor = docList[Math.floor(Math.random() * docList.length)];
        
        const diagList = diagnoses[dept];
        const diagnosis = diagList[Math.floor(Math.random() * diagList.length)];
        
        const revenue = Math.floor(Math.random() * 1500) + 50;
        const waitingTime = Math.floor(Math.random() * 110) + 10;

        records.push(`${i},${date},${time},${doctor},${dept},${diagnosis},${revenue},${waitingTime}\n`);
    }

    fs.writeFileSync(csvPath, records.join(''));
    console.log(`Successfully generated 1000 records in ${csvPath}`);
}

if (require.main === module) {
    generateCSV();
}

module.exports = generateCSV;
