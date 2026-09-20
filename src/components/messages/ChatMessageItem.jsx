import React from 'react';

export default function ChatMessageItem({ message }) {
  const isMe = message.senderId === 'me';
  const isSystem = message.senderId === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[11px] font-medium border border-gray-200">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[70%] space-y-1">
        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isMe
              ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
          }`}
        >
          <p className="leading-relaxed whitespace-pre-line">{message.text}</p>
        </div>
        {/* Timestamp */}
        <p className={`text-[10px] text-gray-400 font-medium ${isMe ? 'text-right' : 'text-left'}`}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}
