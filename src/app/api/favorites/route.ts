import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

function getDatabase() {
  const isProduction = process.env.NODE_ENV === 'production';
  const dbPath = isProduction ? ':memory:' : path.join(process.cwd(), 'data', 'rental.db');
  const db = new Database(dbPath);
  
  // Enable foreign key constraints
  db.pragma('foreign_keys = ON');
  
  // Always ensure tables exist
  ensureTablesExist(db);
  
  // Initialize database if in production
  if (isProduction) {
    initializeDatabase(db);
  }
  
  return db;
}

function ensureTablesExist(db: Database.Database) {
  // Create favorites table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER,
      user_session TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties (id)
    )
  `);
}

function initializeDatabase(db: Database.Database) {
  // Create tables
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

  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER,
      user_session TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties (id)
    )
  `);

  // Check if data already exists
  const count = db.prepare('SELECT COUNT(*) as count FROM properties').get() as { count: number };
  
  if (count.count === 0) {
    // Insert sample data
    const insertProperty = db.prepare(`
      INSERT INTO properties 
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
  }
}

export async function POST(request: NextRequest) {
  try {
    const { propertyId, userSession } = await request.json();
    
    console.log('Favorites request:', { propertyId, userSession });
    
    if (!propertyId || !userSession) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDatabase();
    
    // Check if property exists
    const property = db.prepare('SELECT id FROM properties WHERE id = ?').get(propertyId);
    if (!property) {
      db.close();
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    // Check if already favorited
    const checkStmt = db.prepare('SELECT id FROM favorites WHERE property_id = ? AND user_session = ?');
    const existing = checkStmt.get(propertyId, userSession);
    
    if (existing) {
      // Remove from favorites
      const deleteStmt = db.prepare('DELETE FROM favorites WHERE property_id = ? AND user_session = ?');
      deleteStmt.run(propertyId, userSession);
      console.log('Removed from favorites:', propertyId);
      db.close();
      return NextResponse.json({ favorited: false, message: 'Removed from favorites' });
    } else {
      // Add to favorites
      const insertStmt = db.prepare('INSERT INTO favorites (property_id, user_session) VALUES (?, ?)');
      const result = insertStmt.run(propertyId, userSession);
      console.log('Added to favorites:', propertyId, 'ID:', result.lastInsertRowid);
      db.close();
      return NextResponse.json({ favorited: true, message: 'Added to favorites' });
    }
  } catch (error) {
    console.error('Favorites error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userSession = searchParams.get('userSession');
  
  console.log('Get favorites for user:', userSession);
  
  if (!userSession) {
    return NextResponse.json({ error: 'User session required' }, { status: 400 });
  }

  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT p.*, f.created_at as favorited_at FROM properties p
      JOIN favorites f ON p.id = f.property_id
      WHERE f.user_session = ?
      ORDER BY f.created_at DESC
    `);
    const favorites = stmt.all(userSession);
    
    console.log(`Found ${favorites.length} favorites for user ${userSession}`);
    
    db.close();
    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
