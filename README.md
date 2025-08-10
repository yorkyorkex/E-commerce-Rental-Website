# 租屋網站

一個使用 Next.js、TypeScript 和 SQLite 建立的現代化租屋網站。

## 功能特色

- 🏠 房屋列表展示
- 🔍 搜尋和篩選功能
- ❤️ 收藏功能
- 📱 響應式設計
- 📞 聯繫房東功能
- 🎨 現代化 UI 設計

## 技術棧

- **前端**: Next.js 14, React, TypeScript
- **樣式**: Tailwind CSS
- **資料庫**: SQLite with Better-SQLite3
- **圖示**: Lucide React
- **部署**: Vercel

## 開始使用

### 安裝依賴 

```bash
npm install
```

### 初始化資料庫

```bash
npm run db:init
```

### 啟動開發伺服器

```bash
npm run dev
```

在瀏覽器中打開 [http://localhost:3000](http://localhost:3000) 查看結果。

### 建構部署

```bash
npm run build
npm start
```

## 資料庫結構

### Properties 表格
- id: 主鍵
- title: 物件標題
- description: 物件描述
- price: 月租金
- location: 地點
- area: 坪數
- bedrooms: 房間數
- bathrooms: 衛浴數
- type: 物件類型
- images: 圖片 URL
- amenities: 設施設備
- contact_name: 聯絡人姓名
- contact_phone: 聯絡電話
- contact_email: 聯絡郵箱

### Favorites 表格
- id: 主鍵
- property_id: 物件 ID (外鍵)
- user_session: 使用者會話 ID

## API 路由

- `GET /api/properties` - 取得物件列表 (支援篩選)
- `GET /api/properties/[id]` - 取得單一物件詳情
- `POST /api/favorites` - 新增/移除收藏
- `GET /api/favorites` - 取得收藏列表

## 部署到 Vercel

1. 將專案推送到 GitHub
2. 在 Vercel 連接 GitHub 倉庫
3. Vercel 會自動建構和部署

## 專案結構

```
src/
├── app/
│   ├── api/
│   │   ├── properties/
│   │   └── favorites/
│   ├── property/[id]/
│   ├── favorites/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── PropertyCard.tsx
│   ├── SearchBar.tsx
│   └── FilterPanel.tsx
├── lib/
│   └── database.ts
└── types/
    └── index.ts
```

## 環境要求

- Node.js 18+
- npm 或 yarn

## 授權

MIT License
