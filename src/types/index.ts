export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  images: string;
  amenities: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  created_at: string;
}

export interface SearchFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  type?: string;
  query?: string;
}

export interface Favorite {
  id: number;
  property_id: number;
  user_session: string;
  created_at: string;
}
