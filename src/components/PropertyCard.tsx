'use client';

import React, { useState, useEffect } from 'react';
import { Property } from '@/types';
import Image from 'next/image';
import { MapPin, Bed, Bath, Square, Heart } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onFavoriteChange?: () => void;
}

export default function PropertyCard({ property, onFavoriteChange }: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const amenities = property.amenities ? property.amenities.split(',') : [];
  
  useEffect(() => {
    checkFavoriteStatus();
  }, [property.id]);

  const checkFavoriteStatus = async () => {
    try {
      const userSession = localStorage.getItem('userSession');
      if (!userSession) return;

      const response = await fetch(`/api/favorites?userSession=${userSession}`);
      if (response.ok) {
        const favorites = await response.json();
        const isFav = favorites.some((fav: any) => fav.id === property.id);
        setIsFavorited(isFav);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };
  
  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    setLoading(true);
    
    try {
      // Simple localStorage session for user identification
      const userSession = localStorage.getItem('userSession') || Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userSession', userSession);

      console.log('Toggling favorite for property:', property.id);

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.id,
          userSession,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Favorite toggle result:', result);
        setIsFavorited(result.favorited);
        if (onFavoriteChange) {
          onFavoriteChange();
        }
      } else {
        const error = await response.json();
        console.error('Favorite toggle error:', error);
        throw new Error(error.error || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // You could show a toast notification here
    } finally {
      setLoading(false);
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
          disabled={loading}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all duration-200 ${
            isFavorited 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-white text-gray-400 hover:bg-red-50 hover:text-red-500'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
        >
          <Heart 
            className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} 
          />
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
              <span>{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms} bath</span>
            </div>
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              <span>{property.area} sqft</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              $ {property.price.toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm">/month</span>
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
                  +{amenities.length - 3} more
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
            View Details
          </a>
        </div>
      </div>
    </div>
  );
}
