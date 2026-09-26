import React from 'react';
import { MapPin, Calendar } from 'lucide-react';

export default function LoggedItemCard({ item, onEditItem, onDeleteItem }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative font-sans">
      {/* Badge Actions Row */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              item.type === 'lost'
                ? 'bg-[#EFF6FF] text-[#2563EB]'
                : 'bg-[#ECFDF5] text-[#059669]'
            }`}
          >
            {item.type}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            {item.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditItem(item)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                if (onDeleteItem) onDeleteItem(item.id);
              }
            }}
            className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-gray-900 text-lg tracking-tight leading-snug">
          {item.title}
        </h3>
        
        <div className="space-y-1.5 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{item.date}</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed pt-2 border-t border-gray-50">
          {item.description}
        </p>
      </div>

      {/* Image Attachment Indicator (if exists) */}
      {item.image && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>Photo attached</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        </div>
      )}
    </div>
  );
}
