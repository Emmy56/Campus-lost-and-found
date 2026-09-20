import React from 'react';
import { MapPin, Calendar, MessageSquare, Flag } from 'lucide-react';

export default function ItemCard({ item, currentUser, onConnect, onFlagItem }) {
  const isOwnItem = currentUser && item.userId === currentUser.id;

  const handleFlag = () => {
    if (!onFlagItem) return;
    const reason = prompt('Please enter the reason for flagging this listing as suspicious or inappropriate:');
    if (reason) {
      onFlagItem(item.id, reason);
      alert('Listing has been flagged for Admin Moderation review.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative font-sans">
      {/* Header info */}
      <div>
        <div className="flex justify-between items-start mb-3">
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
            <span className="px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
              {item.category}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {isOwnItem ? (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">
                My Item
              </span>
            ) : (
              <button
                onClick={handleFlag}
                title="Flag as suspicious for Admin Moderation"
                className="p-1 text-gray-300 hover:text-amber-600 transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <h3 className="font-extrabold text-gray-900 text-base leading-snug">
          {item.title}
        </h3>
        
        <div className="space-y-1 mt-2.5 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{item.date}</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed pt-3 mt-3 border-t border-gray-50">
          {item.description}
        </p>

        {item.reward && (
          <p className="text-xs font-bold text-orange-600 mt-2 bg-orange-50 px-2.5 py-1 rounded-lg inline-block">
            Reward: {item.reward}
          </p>
        )}
      </div>

      {/* Footer action button */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] text-gray-400 font-medium">
          Posted by: {isOwnItem ? 'You' : 'Student Peer'}
        </span>
        {!isOwnItem && (
          <button
            onClick={() => onConnect(item)}
            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
