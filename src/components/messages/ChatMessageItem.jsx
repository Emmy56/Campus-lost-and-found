import React from 'react';

export default function ChatMessageItem({ message, currentUser }) {
  const isMe = message.senderId === 'me' || (currentUser && message.senderId === currentUser.id);
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
        {/* Sender Name */}
        <p className={`text-[10px] font-bold text-gray-400 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
          {isMe ? 'You' : (message.senderName || 'Student')}
        </p>

        {/* Bubble: Blue Background for Sent Messages (Right), Light Gray for Received (Left) */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isMe
              ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
              : 'bg-gray-100 text-gray-900 border border-gray-200 rounded-tl-none shadow-sm'
          }`}
        >
          {message.image && (
            <div className="mb-2 overflow-hidden rounded-xl">
              <img
                src={message.image}
                alt="Attachment"
                className="max-h-60 max-w-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(message.image, '_blank')}
              />
            </div>
          )}
          {message.text && (
            <p className="leading-relaxed whitespace-pre-line">{message.text}</p>
          )}
        </div>

        {/* Timestamp */}
        <p className={`text-[10px] text-gray-400 font-medium px-1 ${isMe ? 'text-right' : 'text-left'}`}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}
