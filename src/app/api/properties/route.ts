import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { Property, SearchFilters } from '@/types';

function getDatabase() {
  const isProduction = process.env.NODE_ENV === 'production';
  const dbPath = isProduction ? ':memory:' : path.join(process.cwd(), 'data', 'rental.db');
  const db = new Database(dbPath);
  
  // Enable foreign key constraints
  db.pragma('foreign_keys = ON');
  
  // Initialize database if in production or if tables don't exist
  if (isProduction) {
    initializeDatabase(db);
  }
  
  return db;
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
      ],
      [
        'Modern Condo in Chicago',
        'Spacious modern condominium with stunning city views. Located in the heart of Chicago with easy access to public transportation.',
        2800,
        'Chicago, Illinois',
        900,
        2,
        2,
        'Condo',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500',
        'Air Conditioning,Washer,Dryer,Dishwasher,Internet,TV,Gym,Pool',
        'Robert Chen',
        '+1-555-234-567',
        'robert@example.com'
      ],
      [
        'Beachfront Villa in San Diego',
        'Stunning beachfront villa with private beach access. Perfect for vacation rentals with panoramic ocean views.',
        4500,
        'San Diego, California',
        1800,
        4,
        3,
        'Villa',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500',
        'Air Conditioning,Washer,Dryer,Dishwasher,Internet,TV,Beach Access,Parking',
        'Maria Garcia',
        '+1-555-345-789',
        'maria@example.com'
      ],
      [
        'Historic Townhouse in Boston',
        'Charming historic townhouse in the heart of Boston. Walking distance to Freedom Trail and Boston Common.',
        3200,
        'Boston, Massachusetts',
        1100,
        3,
        2,
        'Townhouse',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500',
        'Air Conditioning,Washer,Dryer,Dishwasher,Internet,TV,Fireplace',
        'James Murphy',
        '+1-555-456-890',
        'james@example.com'
      ],
      [
        'Mountain Cabin in Denver',
        'Cozy mountain cabin with breathtaking views. Perfect for nature lovers and outdoor enthusiasts.',
        1900,
        'Denver, Colorado',
        700,
        2,
        1,
        'Cabin',
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500',
        'Air Conditioning,Fireplace,Internet,TV,Mountain View,Hiking Trails',
        'Jennifer Wilson',
        '+1-555-567-123',
        'jennifer@example.com'
      ],
      [
        'Urban Loft in Seattle',
        'Industrial-style loft in trendy Seattle neighborhood. High ceilings and exposed brick walls.',
        2600,
        'Seattle, Washington',
        800,
        1,
        1,
        'Loft',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500',
        'Air Conditioning,Washer,Dryer,Internet,TV,Exposed Brick,High Ceilings',
        'Alex Thompson',
        '+1-555-678-234',
        'alex@example.com'
      ],
      [
        'Luxury Penthouse in Las Vegas',
        'Exclusive penthouse with stunning Strip views. Premium amenities and world-class service.',
        5500,
        'Las Vegas, Nevada',
        1500,
        3,
        3,
        'Penthouse',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500',
        'Air Conditioning,Washer,Dryer,Dishwasher,Internet,TV,Strip View,Concierge,Pool,Gym',
        'Victoria Lee',
        '+1-555-789-345',
        'victoria@example.com'
      ]
    ];

    sampleProperties.forEach(property => {
      insertProperty.run(...property);
    });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const filters: SearchFilters = {
    location: searchParams.get('location') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
    type: searchParams.get('type') || undefined,
    query: searchParams.get('query') || undefined,
  };

  try {
    const db = getDatabase();
    
    let sql = 'SELECT * FROM properties WHERE 1=1';
    const params: any[] = [];

    if (filters.location) {
      sql += ' AND location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.minPrice) {
      sql += ' AND price >= ?';
      params.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      sql += ' AND price <= ?';
      params.push(filters.maxPrice);
    }

    if (filters.bedrooms) {
      sql += ' AND bedrooms = ?';
      params.push(filters.bedrooms);
    }

    if (filters.type) {
      sql += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.query) {
      sql += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${filters.query}%`, `%${filters.query}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const stmt = db.prepare(sql);
    const properties = stmt.all(...params) as Property[];
    
    db.close();

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
