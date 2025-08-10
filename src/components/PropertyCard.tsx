'use client';

import React from 'react';
import { Property } from '@/types';
import Image from 'next/image';
import { MapPin, Bed, Bath, Square, Heart } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const amenities = property.amenities ? property.amenities.split(',') : [];
  
  const handleFavorite = async () => {
    // 簡單的本地存儲作為用戶會話
    const userSession = localStorage.getItem('userSession') || Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userSession', userSession);

    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.id,
          userSession,
        }),
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={property.images}
          alt={property.title}
          fill
          className="object-cover"
        />
        <button
          onClick={handleFavorite}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
        >
          <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {property.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span>{property.bedrooms}房</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms}衛</span>
            </div>
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              <span>{property.area}坪</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              NT$ {property.price.toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm">/月</span>
          </div>
          <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
            {property.type}
          </span>
        </div>
        
        {amenities.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-1">
              {amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {amenity.trim()}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{amenities.length - 3} 更多
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <a
            href={`/property/${property.id}`}
            className="block w-full bg-primary-600 text-white text-center py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
          >
            查看詳情
          </a>
        </div>
      </div>
    </div>
  );
}
