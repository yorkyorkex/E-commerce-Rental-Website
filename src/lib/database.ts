import Database from 'better-sqlite3';
import path from 'path';

// For Vercel deployment, use in-memory database since file system is read-only
const isProduction = process.env.NODE_ENV === 'production';
const dbPath = isProduction ? ':memory:' : path.join(process.cwd(), 'data', 'rental.db');

// Create database connection
export const db = new Database(dbPath);

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

// Create tables and initialize data
export function initializeDatabase() {
  // Create properties table
  db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      location TEXT NOT NULL,
      area INTEGER,
      bedrooms INTEGER,
      bathrooms INTEGER,
      type TEXT NOT NULL,
      images TEXT,
      amenities TEXT,
      contact_name TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create favorites table
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER,
      user_session TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties (id)
    )
  `);

  // Insert sample data
  const insertProperty = db.prepare(`
    INSERT OR IGNORE INTO properties 
    (title, description, price, location, area, bedrooms, bathrooms, type, images, amenities, contact_name, contact_phone, contact_email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleProperties = [
    [
      'Beautiful Apartment in Manhattan',
      'Located in the heart of Manhattan, this beautiful one-bedroom apartment offers convenient transportation and excellent living facilities. Just 3 minutes walk to subway station.',
      2500,
      'Manhattan, New York',
      850,
      1,
      1,
      'Apartment',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
      'Air Conditioning,Washer,Refrigerator,Internet,TV',
      'John Smith',
      '+1-555-345-678',
      'john@example.com'
    ],
    [
      'Cozy Studio in Brooklyn',
      'Newly renovated studio perfect for young professionals or students. Includes all basic furniture, move-in ready.',
      1800,
      'Brooklyn, New York',
      500,
      1,
      1,
      'Studio',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
      'Air Conditioning,Bed,Desk,Closet,Internet',
      'Emily Johnson',
      '+1-555-456-789',
      'emily@example.com'
    ],
    [
      'Luxury 3BR in Downtown',
      'Luxury three-bedroom apartment perfect for families. Well-managed community with swimming pool and gym facilities.',
      3500,
      'Downtown, Los Angeles',
      1200,
      3,
      2,
      'High-rise',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500',
      'Air Conditioning,Washer,Refrigerator,Internet,TV,Parking,Concierge',
      'David Wilson',
      '+1-555-567-890',
      'david@example.com'
    ],
    [
      'Business Suite in Miami',
      'Business suite located in downtown Miami, perfect for business trips or short-term stays. Surrounded by restaurants and shops.',
      2200,
      'Miami, Florida',
      700,
      1,
      1,
      'Suite',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500',
      'Air Conditioning,Bed,Desk,Internet,TV',
      'Sarah Davis',
      '+1-555-678-901',
      'sarah@example.com'
    ],
    [
      'Student Housing near Campus',
      'Student housing near university campus, quiet environment perfect for studying. Clean and tidy rooms at affordable prices.',
      1200,
      'Austin, Texas',
      400,
      1,
      1,
      'Shared Room',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500',
      'Bed,Desk,Closet,Internet,Shared Kitchen',
      'Michael Brown',
      '+1-555-789-012',
      'michael@example.com'
    ],
    [
      'Artistic Loft in Portland',
      'Artistic loft-style apartment in Portland downtown, near the university. Warm decoration, perfect for those who enjoy quiet environments.',
      1600,
      'Portland, Oregon',
      600,
      1,
      1,
      'Loft',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=500',
      'Air Conditioning,Bed,Desk,Closet,Internet',
      'Lisa Anderson',
      '+1-555-890-123',
      'lisa@example.com'
    ]
  ];

  sampleProperties.forEach(property => {
    insertProperty.run(...property);
  });

  console.log('Database initialized with sample data');
}

// Initialize database when in production or when explicitly called
if (process.env.NODE_ENV === 'production') {
  initializeDatabase();
}

export default db;
