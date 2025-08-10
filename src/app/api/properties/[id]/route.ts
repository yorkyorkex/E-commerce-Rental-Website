import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { Property } from '@/types';

function getDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'rental.db');
  return new Database(dbPath);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM properties WHERE id = ?');
    const property = stmt.get(params.id) as Property;
    
    db.close();

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
