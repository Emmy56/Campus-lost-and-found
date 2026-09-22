import React from 'react';
import { MapPin, MessageSquare, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function MatchCard({
  match,
  userItem,
  onOpenChat,
  onUpdateMatchStatus
}) {
  const isFinder = userItem?.type === 'found';

  // Extract titles and locations dynamically based on user ownership
  const isUserItemMatchUser = match.userItemId === userItem?.id;
  const matchedTitle = isUserItemMatchUser ? match.matchedItemTitle : (match.userItemTitle || 'Matched Item');
  const matchedLocation = isUserItemMatchUser ? match.matchedItemLocation : (match.userItemLocation || 'Campus Area');

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col xl:flex-row xl:items-center justify-between gap-6 font-sans">
      {/* Left: Your Item */}
      <div className="flex-1 bg-gray-50/50 rounded-lg p-4 border border-gray-50">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
          Your Item ({userItem?.type === 'lost' ? 'Lost' : 'Found'})
        </span>
        <h4 className="font-extrabold text-gray-900 text-base">
          {userItem?.title || 'Unknown Item'}
        </h4>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span>{userItem?.location}</span>
        </div>
      </div>

      {/* Center: Match Percentage */}
      <div className="flex flex-col items-center justify-center shrink-0 py-2">
        <span className="px-3 py-1 text-xs font-bold text-[#2563EB] bg-[#EFF6FF] rounded-full border border-blue-100">
          {match.matchPercentage}% Match
        </span>
        <div className="w-16 h-0.5 bg-gray-100 mt-2.5 hidden xl:block" />
      </div>

      {/* Right: Matched Item */}
      <div className="flex-1 bg-gray-50/50 rounded-lg p-4 border border-gray-50">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
          Matched Item ({userItem?.type === 'lost' ? 'Found' : 'Lost'})
        </span>
        <h4 className="font-extrabold text-gray-900 text-base">
          {matchedTitle}
        </h4>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span>{matchedLocation}</span>
        </div>
      </div>

      {/* Action States */}
      <div className="shrink-0 flex flex-col sm:flex-row xl:flex-col gap-2.5 min-w-[170px] justify-center">
        {match.status === 'pending' && (
          isFinder ? (
            <div className="px-3.5 py-2.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 text-center shadow-xs">
              <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Awaiting owner to message</span>
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenChat(match.chatId)}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message Finder
              </button>
              <button
                onClick={() => onUpdateMatchStatus(match.id, 'rejected')}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Not a Match
              </button>
            </>
          )
        )}

        {match.status === 'confirmed' && (
          <div className="flex flex-col gap-2 w-full">
            <span className="px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Match Confirmed
            </span>

            <button
              onClick={() => onOpenChat(match.chatId)}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              View Chat
            </button>
          </div>
        )}

        {match.status === 'rejected' && (
          <span className="px-3 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
            <XCircle className="w-4 h-4 text-gray-400" />
            Match Rejected
          </span>
        )}
      </div>
    </div>
  );
}
