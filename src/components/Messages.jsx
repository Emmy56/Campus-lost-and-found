import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, Send } from 'lucide-react';
import ConversationItem from './messages/ConversationItem';
import ChatMessageItem from './messages/ChatMessageItem';
import ChatHeader from './messages/ChatHeader';

export default function Messages({
  conversations,
  matches,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onConfirmMatchInChat,
  onBackToDashboard
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Auto scroll to bottom of active conversation messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(activeConversation.id, inputText);
    setInputText('');
  };

  // Find if there's a match associated with this conversation
  const associatedMatch = matches.find(m => m.chatId === activeConversation?.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header with Back Arrow */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBackToDashboard}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">Chat with finders of items</p>
        </div>
      </div>

      {/* Main Grid Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[640px]">
        
        {/* Left Side: Conversation List */}
        <div className="lg:col-span-4 border-r border-gray-100 flex flex-col h-full bg-white">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-50 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-7 top-7" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Conversations container */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 font-medium">
                No chats found
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConversation?.id}
                  onSelect={onSelectConversation}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Side: Active Conversation Panel */}
        <div className="lg:col-span-8 flex flex-col h-full bg-gray-50/30">
          {activeConversation ? (
            <>
              {/* Active Conversation Header */}
              <ChatHeader
                conversation={activeConversation}
                associatedMatch={associatedMatch}
                onConfirmMatchInChat={onConfirmMatchInChat}
              />

              {/* Message History area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeConversation.messages.map((msg) => (
                  <ChatMessageItem key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Footer Form */}
              <form
                onSubmit={handleSend}
                className="bg-white border-t border-gray-100 p-4 px-6 flex items-center gap-4 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Type a message"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-800 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-white transition-all shadow-md shrink-0 cursor-pointer ${
                    inputText.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
