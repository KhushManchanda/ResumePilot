require('dotenv').config();
const { initializeDatabase } = require('../dist/db/database');

console.log('Running database migrations...');
initializeDatabase();
console.log('✅ Migrations complete!');
