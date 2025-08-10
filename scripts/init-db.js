const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 確保資料目錄存在
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'rental.db');
const db = new Database(dbPath);

// 啟用外鍵約束
db.pragma('foreign_keys = ON');

// 創建資料表/
console.log('Creating tables...');

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

// 插入示例資料
console.log('Inserting sample data...');

const insertProperty = db.prepare(`
  INSERT OR IGNORE INTO properties 
  (title, description, price, location, area, bedrooms, bathrooms, type, images, amenities, contact_name, contact_phone, contact_email)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const sampleProperties = [
  [
    '台北市中山區精美公寓',
    '位於中山區的精美一房一廳公寓，交通便利，生活機能完善。近捷運站，步行3分鐘即可到達。',
    25000,
    '台北市中山區',
    25,
    1,
    1,
    '公寓',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
    '冷氣,洗衣機,冰箱,網路,電視',
    '王小明',
    '0912-345-678',
    'wang@example.com'
  ],
  [
    '新北市板橋區溫馨套房',
    '全新裝潢的套房，適合單身上班族或學生。包含所有基本家具，拎包即可入住。',
    18000,
    '新北市板橋區',
    15,
    1,
    1,
    '套房',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
    '冷氣,床,書桌,衣櫃,網路',
    '李美華',
    '0923-456-789',
    'lee@example.com'
  ],
  [
    '台中市西屯區豪華三房',
    '豪華三房兩廳，適合家庭居住。社區管理完善，有游泳池和健身房等公共設施。',
    35000,
    '台中市西屯區',
    80,
    3,
    2,
    '電梯大廈',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500',
    '冷氣,洗衣機,冰箱,網路,電視,停車位,管理員',
    '張大偉',
    '0934-567-890',
    'zhang@example.com'
  ],
  [
    '高雄市前金區商務套房',
    '位於高雄市中心的商務套房，適合出差或短期居住。周邊有許多餐廳和商店。',
    22000,
    '高雄市前金區',
    20,
    1,
    1,
    '套房',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500',
    '冷氣,床,書桌,網路,電視',
    '陳雅文',
    '0945-678-901',
    'chen@example.com'
  ],
  [
    '桃園市中壢區學生宿舍',
    '靠近中原大學的學生宿舍，環境安靜，適合讀書。房間乾淨整潔，價格實惠。',
    12000,
    '桃園市中壢區',
    12,
    1,
    1,
    '雅房',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500',
    '床,書桌,衣櫃,網路,共用廚房',
    '劉志明',
    '0956-789-012',
    'liu@example.com'
  ],
  [
    '台南市東區文青小屋',
    '充滿文青風格的小套房，位於台南市區，鄰近成功大學。裝潢溫馨，適合喜歡安靜環境的租客。',
    16000,
    '台南市東區',
    18,
    1,
    1,
    '套房',
    'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=500',
    '冷氣,床,書桌,衣櫃,網路',
    '黃淑芬',
    '0967-890-123',
    'huang@example.com'
  ]
];

sampleProperties.forEach(property => {
  insertProperty.run(...property);
});

console.log('Database initialized successfully!');
console.log(`Database location: ${dbPath}`);

db.close();
