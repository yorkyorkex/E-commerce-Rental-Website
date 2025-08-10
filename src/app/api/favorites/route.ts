import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

function getDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'rental.db');
  return new Database(dbPath);
}

export async function POST(request: NextRequest) {
  try {
    const { propertyId, userSession } = await request.json();
    
    if (!propertyId || !userSession) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDatabase();
    
    // 檢查是否已經收藏
    const checkStmt = db.prepare('SELECT id FROM favorites WHERE property_id = ? AND user_session = ?');
    const existing = checkStmt.get(propertyId, userSession);
    
    if (existing) {
      // 移除收藏
      const deleteStmt = db.prepare('DELETE FROM favorites WHERE property_id = ? AND user_session = ?');
      deleteStmt.run(propertyId, userSession);
      db.close();
      return NextResponse.json({ favorited: false });
    } else {
      // 新增收藏
      const insertStmt = db.prepare('INSERT INTO favorites (property_id, user_session) VALUES (?, ?)');
      insertStmt.run(propertyId, userSession);
      db.close();
      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userSession = searchParams.get('userSession');
  
  if (!userSession) {
    return NextResponse.json({ error: 'User session required' }, { status: 400 });
  }

  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT p.* FROM properties p
      JOIN favorites f ON p.id = f.property_id
      WHERE f.user_session = ?
      ORDER BY f.created_at DESC
    `);
    const favorites = stmt.all(userSession);
    
    db.close();
    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
