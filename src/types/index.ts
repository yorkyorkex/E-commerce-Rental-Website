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

export interface Booking {
  id: number;
  property_id: number;
  user_session: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_price: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method?: string;
  payment_id?: string;
  created_at: string;
}

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  payment_method: 'credit_card' | 'google_pay' | 'apple_pay' | 'paypal';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  created_at: string;
}

export interface BookingRequest {
  property_id: number;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  user_session: string;
}

export interface PaymentRequest {
  booking_id: number;
  payment_method: 'credit_card' | 'google_pay' | 'apple_pay' | 'paypal';
  card_details?: {
    number: string;
    expiry: string;
    cvv: string;
    name: string;
  };
}
