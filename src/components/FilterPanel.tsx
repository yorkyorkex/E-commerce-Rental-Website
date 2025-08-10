'use client';

import React from 'react';
import { SearchFilters } from '@/types';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const locations = [
    '台北市中山區',
    '台北市大安區',
    '新北市板橋區',
    '台中市西屯區',
    '高雄市前金區',
    '桃園市中壢區',
    '台南市東區',
  ];

  const propertyTypes = ['套房', '雅房', '公寓', '電梯大廈', '透天厝'];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">篩選條件</h3>
      
      {/* 價格範圍 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          租金範圍 (NT$)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="最低價格"
            value={filters.minPrice || ''}
            onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <input
            type="number"
            placeholder="最高價格"
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* 地區 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          地區
        </label>
        <select
          value={filters.location || ''}
          onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">選擇地區</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      {/* 房間數 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          房間數
        </label>
        <select
          value={filters.bedrooms || ''}
          onChange={(e) => handleFilterChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">不限</option>
          <option value="1">1房</option>
          <option value="2">2房</option>
          <option value="3">3房</option>
          <option value="4">4房以上</option>
        </select>
      </div>

      {/* 物件類型 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          物件類型
        </label>
        <select
          value={filters.type || ''}
          onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">所有類型</option>
          {propertyTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* 清除篩選 */}
      <button
        onClick={() => onFiltersChange({})}
        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
      >
        清除所有篩選
      </button>
    </div>
  );
}
