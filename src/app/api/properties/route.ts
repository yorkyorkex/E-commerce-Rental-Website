import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { Property, SearchFilters } from '@/types';

function getDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'rental.db');
  return new Database(dbPath);
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
