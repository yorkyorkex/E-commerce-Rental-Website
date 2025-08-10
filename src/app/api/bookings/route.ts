import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { BookingRequest } from '@/types';

// Database initialization for production
function getDatabase() {
  const isProduction = process.env.NODE_ENV === 'production';
  const dbPath = isProduction ? ':memory:' : path.join(process.cwd(), 'data', 'rental.db');
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  
  // Always ensure tables exist
  ensureTablesExist(db);
  
  if (isProduction) {
    initializeDatabase(db);
  }
  
  return db;
}

function ensureTablesExist(db: Database.Database) {
  // Create bookings table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER,
      user_session TEXT,
      check_in_date TEXT NOT NULL,
      check_out_date TEXT NOT NULL,
      guests INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      payment_method TEXT,
      payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties (id)
    )
  `);

  // Create payments table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings (id)
    )
  `);
}

function initializeDatabase(db: Database.Database) {
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

  // Create bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER,
      user_session TEXT,
      check_in_date TEXT NOT NULL,
      check_out_date TEXT NOT NULL,
      guests INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      payment_method TEXT,
      payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties (id)
    )
  `);

  // Create payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings (id)
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
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabase();
    const body: BookingRequest = await request.json();
    
    console.log('Received booking request:', body);
    
    const { property_id, check_in_date, check_out_date, guests, user_session } = body;
    
    // Validate required fields
    if (!property_id || !check_in_date || !check_out_date || !guests || !user_session) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    
    if (checkIn < today) {
      return NextResponse.json({ error: 'Check-in date cannot be in the past' }, { status: 400 });
    }
    
    if (checkOut <= checkIn) {
      return NextResponse.json({ error: 'Check-out date must be after check-in date' }, { status: 400 });
    }
    
    // Get property details
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(property_id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    console.log('Found property:', property);
    
    // Calculate total price (price per night * number of nights)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const total_price = (property as any).price * nights;
    
    console.log(`Calculating price: ${(property as any).price} * ${nights} nights = ${total_price}`);
    
    // Create booking
    const insertBooking = db.prepare(`
      INSERT INTO bookings (property_id, user_session, check_in_date, check_out_date, guests, total_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertBooking.run(property_id, user_session, check_in_date, check_out_date, guests, total_price);
    
    console.log('Booking created with ID:', result.lastInsertRowid);
    
    // Get the created booking
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
    
    db.close();
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const user_session = searchParams.get('user_session');
    
    if (!user_session) {
      return NextResponse.json({ error: 'User session required' }, { status: 400 });
    }
    
    const bookings = db.prepare(`
      SELECT b.*, p.title, p.images, p.location 
      FROM bookings b 
      JOIN properties p ON b.property_id = p.id 
      WHERE b.user_session = ? 
      ORDER BY b.created_at DESC
    `).all(user_session);
    
    db.close();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
