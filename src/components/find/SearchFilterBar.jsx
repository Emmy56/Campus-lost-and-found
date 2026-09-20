import React from 'react';
import { Search } from 'lucide-react';

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterCategory,
  onFilterCategoryChange,
  dateRange,
  onDateRangeChange,
  categories = []
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 font-sans">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search items by name, keywords, location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors text-gray-800"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex gap-2 w-full md:w-auto shrink-0 justify-start">
          <button
            onClick={() => onFilterTypeChange('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors border ${
              filterType === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => onFilterTypeChange('lost')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors border ${
              filterType === 'lost'
                ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Lost Items
          </button>
          <button
            onClick={() => onFilterTypeChange('found')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors border ${
              filterType === 'found'
                ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Found Items
          </button>
        </div>

        {/* Date Range Dropdown */}
        <div className="w-full md:w-40 shrink-0 relative">
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-xs font-semibold focus:outline-none focus:border-blue-500 transition-colors cursor-pointer text-gray-700"
          >
            <option value="all">📅 Any Date</option>
            <option value="24h">Past 24 Hours</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
          </select>
        </div>

        {/* Category Filter Dropdown */}
        <div className="w-full md:w-44 shrink-0">
          <select
            value={filterCategory}
            onChange={(e) => onFilterCategoryChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-blue-500 transition-colors cursor-pointer text-gray-700 capitalize"
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
