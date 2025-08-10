import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { PaymentRequest } from '@/types';

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

// Simulate payment processing
function processPayment(paymentMethod: string, amount: number, cardDetails?: any): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  return new Promise((resolve) => {
    // Simulate payment processing delay
    setTimeout(() => {
      // Simulate 90% success rate
      const success = Math.random() > 0.1;
      
      if (success) {
        resolve({
          success: true,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      } else {
        resolve({
          success: false,
          error: 'Payment processing failed. Please try again.'
        });
      }
    }, 2000); // 2 second delay to simulate real payment processing
  });
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabase();
    const body: PaymentRequest = await request.json();
    
    const { booking_id, payment_method, card_details } = body;
    
    // Get booking details
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    const bookingData = booking as any;
    
    // Check if booking is already paid
    if (bookingData.payment_status === 'completed') {
      return NextResponse.json({ error: 'Booking is already paid' }, { status: 400 });
    }
    
    // Validate payment method specific requirements
    if (payment_method === 'credit_card') {
      if (!card_details || !card_details.number || !card_details.expiry || !card_details.cvv || !card_details.name) {
        return NextResponse.json({ error: 'Credit card details are required' }, { status: 400 });
      }
    }
    
    // Process payment
    const paymentResult = await processPayment(payment_method, bookingData.total_price, card_details);
    
    if (!paymentResult.success) {
      return NextResponse.json({ error: paymentResult.error }, { status: 400 });
    }
    
    // Create payment record
    const insertPayment = db.prepare(`
      INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const paymentRecord = insertPayment.run(
      booking_id,
      bookingData.total_price,
      payment_method,
      'completed',
      paymentResult.transactionId
    );
    
    // Update booking status
    const updateBooking = db.prepare(`
      UPDATE bookings 
      SET payment_status = 'completed', payment_method = ?, payment_id = ?
      WHERE id = ?
    `);
    
    updateBooking.run(payment_method, paymentResult.transactionId, booking_id);
    
    // Get updated booking
    const updatedBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
    
    db.close();
    
    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      payment: {
        id: paymentRecord.lastInsertRowid,
        transaction_id: paymentResult.transactionId,
        amount: bookingData.total_price,
        payment_method,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
