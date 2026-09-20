import React from 'react';
import { Bell, Sparkles, MessageSquare, CheckCheck } from 'lucide-react';

export default function NotificationDrawer({
  notifications = [],
  isOpen,
  onClose,
  onMarkAllAsRead,
  onNotificationClick
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-14 w-80 sm:w-96 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden font-sans animate-fade-in">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <h3 className="font-extrabold text-gray-900 text-sm">Notifications</h3>
        </div>
        <button
          onClick={onMarkAllAsRead}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark all as read
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400">
            No new notifications
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                onNotificationClick(n);
                onClose();
              }}
              className={`p-4 flex gap-3 items-start cursor-pointer hover:bg-gray-50 transition-colors ${
                !n.read ? 'bg-blue-50/30 font-medium' : ''
              }`}
            >
              {/* Icon badge */}
              <div className="p-2 rounded-xl shrink-0 mt-0.5">
                {n.type === 'match' && <Sparkles className="w-4 h-4 text-blue-600 bg-blue-100 p-0.5 rounded-md" />}
                {n.type === 'message' && <MessageSquare className="w-4 h-4 text-green-600 bg-green-100 p-0.5 rounded-md" />}
                {n.type === 'system' && <Bell className="w-4 h-4 text-gray-600 bg-gray-100 p-0.5 rounded-md" />}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-gray-900 text-xs truncate">{n.title}</h4>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.timestamp}</span>
                </div>
                <p className="text-xs text-gray-600 leading-snug line-clamp-2">{n.message}</p>
              </div>

              {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
