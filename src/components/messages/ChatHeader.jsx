import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ChatHeader({
  conversation,
  associatedMatch,
  onConfirmMatchInChat
}) {
  const partner = conversation.participants[0];
  const initials = partner?.name
    ? partner.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="bg-white border-b border-gray-100 p-4 px-6 flex items-center justify-between shadow-sm shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
            {initials}
          </div>
          {partner?.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight">
            {conversation.title}
          </h3>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
            {partner?.online ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Confirm Match / Match Status Panel */}
      {associatedMatch && (
        <div className="shrink-0">
          {associatedMatch.status === 'confirmed' ? (
            <span className="px-3 py-1.5 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] rounded-lg text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Match Confirmed
            </span>
          ) : associatedMatch.status === 'rejected' ? (
            <span className="px-3 py-1.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-lg text-xs font-bold">
              Match Rejected
            </span>
          ) : (
            <button
              onClick={() => onConfirmMatchInChat(associatedMatch.id)}
              className="px-3 py-1.5 bg-[#00B050] hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-sm shadow-green-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirm Match
            </button>
          )}
        </div>
      )}
    </div>
  );
}
