import React from 'react';

export default function ConversationItem({
  conversation,
  isActive,
  onSelect,
  currentUser,
  users = []
}) {
  const partner = conversation?.participants?.find(p => p.id !== currentUser?.id) || conversation?.participants?.[0];
  const partnerUser = users?.find(u => u.id === partner?.id || u.email === partner?.email);
  const isOnline = Boolean(partner?.online === true || partnerUser?.isOnline === true || partnerUser?.online === true);

  const initials = partner?.name
    ? partner.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={`p-4 flex items-start gap-3 cursor-pointer transition-colors hover:bg-gray-50/70 select-none ${
        isActive ? 'bg-blue-50/40 hover:bg-blue-50/40 border-l-2 border-blue-600 pl-3.5' : ''
      }`}
    >
      {/* Avatar Circle */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center border border-blue-700">
          {initials}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Meta and Snippet */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h4 className="font-bold text-gray-900 text-sm truncate pr-2">
            {conversation.title}
          </h4>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">
            {conversation.lastMessageTime}
          </span>
        </div>
        <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
          {partner?.name || 'Student'}
        </p>
        <p className="text-xs text-gray-600 truncate mt-1 leading-normal">
          {conversation.lastMessageText}
        </p>
      </div>

      {/* Unread Badge */}
      {conversation.unreadCount > 0 && !isActive && (
        <span className="shrink-0 w-5 h-5 bg-blue-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
          {conversation.unreadCount}
        </span>
      )}
    </div>
  );
}
