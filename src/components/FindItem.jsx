import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import SearchFilterBar from './find/SearchFilterBar';
import ItemCard from './find/ItemCard';

export default function FindItem({ currentUser, items, onConnect, onFlagItem }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const categories = [
    'all',
    'Electronics',
    'Bags & Wallets',
    'Documents & Books',
    'Keys',
    'Clothing & Accessories',
    'Others'
  ];

  // Filter public items based on search query, category, and date range (FR4)
  const viewableItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' ? true : item.type === filterType;
    const matchesCategory = filterCategory === 'all' ? true : item.category === filterCategory;

    // Date range filtering
    let matchesDate = true;
    if (dateRange !== 'all') {
      const itemDate = new Date(item.date).getTime();
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      if (dateRange === '24h') matchesDate = now - itemDate <= oneDay;
      else if (dateRange === '7d') matchesDate = now - itemDate <= 7 * oneDay;
      else if (dateRange === '30d') matchesDate = now - itemDate <= 30 * oneDay;
    }

    return matchesSearch && matchesType && matchesCategory && matchesDate;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 font-sans">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Find items on campus</h1>
        <p className="text-sm text-gray-500 mt-1">Browse and search reported lost & found items logged by students.</p>
      </div>

      {/* Filter and Search Bar Row */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        categories={categories}
      />

      {/* Grid of viewable items */}
      {viewableItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <AlertCircle className="w-12 h-12 text-gray-300" />
          <div>
            <h3 className="font-bold text-gray-800">No matching items found</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              Try adjusting your search query, date filter, or choosing another category.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viewableItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              currentUser={currentUser}
              onConnect={onConnect}
              onFlagItem={onFlagItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
