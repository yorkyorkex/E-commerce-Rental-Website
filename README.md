# Rental Property Website

A modern rental property website built with Next.js, TypeScript, and SQLite.

## Features

- 🏠 Property listing display
- 🔍 Search and filtering functionality
- ❤️ Favorites feature
- 📱 Responsive design
- 📞 Contact landlord functionality
- 🎨 Modern UI design

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Better-SQLite3
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Install Dependencies

```bash
npm install
```

### Initialize Database

```bash
npm run db:init
```

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Build for Production

```bash
npm run build
npm start
```

## Database Structure

### Properties Table
- id: Primary key
- title: Property title
- description: Property description
- price: Monthly rent
- location: Location
- area: Area in square feet
- bedrooms: Number of bedrooms
- bathrooms: Number of bathrooms
- type: Property type
- images: Image URL
- amenities: Facilities and amenities
- contact_name: Contact person name
- contact_phone: Contact phone
- contact_email: Contact email

### Favorites Table
- id: Primary key
- property_id: Property ID (foreign key)
- user_session: User session ID

## API Routes

- `GET /api/properties` - Get property list (with filtering support)
- `GET /api/properties/[id]` - Get single property details
- `POST /api/favorites` - Add/remove favorites
- `GET /api/favorites` - Get favorites list

## Deploy to Vercel

1. Push project to GitHub
2. Connect GitHub repository in Vercel
3. Vercel will automatically build and deploy

## Project Structure

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

## Requirements

- Node.js 18+
- npm or yarn

## License

MIT License
