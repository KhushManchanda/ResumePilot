require('dotenv').config();
const { initializeDatabase, saveResume } = require('../dist/db/database');
const fs = require('fs');
const path = require('path');

console.log('Initializing database...');
initializeDatabase();

console.log('Seeding resume data...');

// Load and save seed data
const seedFiles = [
    'resume_ai_ml.json',
    'resume_full_stack.json',
    'resume_backend_cloud.json'
];

seedFiles.forEach(filename => {
    const filepath = path.join(__dirname, '../seeds', filename);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

    saveResume(data);
    console.log(`✅ Seeded: ${data.variantKey}`);
});

console.log('Database seeded successfully!');
