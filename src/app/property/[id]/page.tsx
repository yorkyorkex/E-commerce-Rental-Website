'use client';

import { useState, useEffect } from 'react';
import { Property } from '@/types';
import Image from 'next/image';
import { MapPin, Bed, Bath, Square, Heart, Phone, Mail, User } from 'lucide-react';

interface PropertyDetailPageProps {
  params: { id: string };
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [params.id]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    const userSession = localStorage.getItem('userSession') || Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userSession', userSession);

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property?.id,
          userSession,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.favorited);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
          <a
            href="/"
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const amenities = property.amenities ? property.amenities.split(',') : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              <a href="/">Rental Properties</a>
            </h1>
            <nav className="flex space-x-8">
              <a href="/" className="text-gray-500 hover:text-gray-900">Home</a>
              <a href="/favorites" className="text-gray-500 hover:text-gray-900">Favorites</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側 - 圖片和詳細資訊 */}
          <div className="lg:col-span-2">
            {/* 主圖 */}
            <div className="relative h-96 rounded-lg overflow-hidden mb-6">
              <Image
                src={property.images}
                alt={property.title}
                fill
                className="object-cover"
              />
            </div>

            {/* 標題和基本資訊 */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {property.title}
                </h1>
                <button
                  onClick={handleFavorite}
                  className={`p-3 rounded-full border-2 transition-colors ${
                    isFavorited
                      ? 'bg-red-50 border-red-500 text-red-500'
                      : 'bg-white border-gray-300 text-gray-400 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">{property.location}</span>
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center text-gray-600">
                  <Bed className="w-5 h-5 mr-2" />
                  <span>{property.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Bath className="w-5 h-5 mr-2" />
                  <span>{property.bathrooms} bathrooms</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Square className="w-5 h-5 mr-2" />
                  <span>{property.area} sqft</span>
                </div>
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                  {property.type}
                </span>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Property Description</h3>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities & Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 text-gray-700 px-3 py-2 rounded-md text-center"
                    >
                      {amenity.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Price and Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  $ {property.price.toLocaleString()}
                </div>
                <div className="text-gray-500">per month</div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Landlord</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{property.contact_name}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <a
                      href={`tel:${property.contact_phone}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {property.contact_phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <a
                      href={`mailto:${property.contact_email}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {property.contact_email}
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href={`tel:${property.contact_phone}`}
                    className="block w-full bg-primary-600 text-white text-center py-3 px-4 rounded-md hover:bg-primary-700 transition-colors font-medium"
                  >
                    Call Now
                  </a>
                  
                  <a
                    href={`mailto:${property.contact_email}?subject=Inquiry about rental: ${property.title}`}
                    className="block w-full bg-white border border-primary-600 text-primary-600 text-center py-3 px-4 rounded-md hover:bg-primary-50 transition-colors font-medium"
                  >
                    Send Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
