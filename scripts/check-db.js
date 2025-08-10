const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'rental.db');
const db = new Database(dbPath);

console.log('=== Properties in database ===');
const properties = db.prepare('SELECT id, title FROM properties').all();
console.log(`Total properties: ${properties.length}`);
properties.forEach(prop => {
  console.log(`${prop.id}: ${prop.title}`);
});

console.log('\n=== Tables in database ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(table => {
  console.log(table.name);
});

db.close();
