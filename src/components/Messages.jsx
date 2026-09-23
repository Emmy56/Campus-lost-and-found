import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, Send, MessageSquare, Image, X } from 'lucide-react';
import ConversationItem from './messages/ConversationItem';
import ChatMessageItem from './messages/ChatMessageItem';
import ChatHeader from './messages/ChatHeader';

export default function Messages({
  currentUser,
  conversations = [],
  matches = [],
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onConfirmMatchInChat,
  onBackToDashboard
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Filter conversations to only include those that have at least 1 message sent or received
  const conversationsWithMessages = conversations.filter(c => c.messages && c.messages.length > 0);

  // Active conversation is explicitly selected by ID (e.g. from Message Finder) or defaults to first with messages
  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversationsWithMessages[0];

  // Filter left-hand conversation column based on search query
  const filteredConversations = conversationsWithMessages.filter(c => 
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.participants && c.participants.some(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Auto scroll ONLY the message history container internally without scrolling the browser page/window!
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeConversation?.messages?.length, activeConversation?.id]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    // Limit file size to ~5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || !activeConversation) return;
    onSendMessage(activeConversation.id, inputText.trim(), selectedImage);
    setInputText('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Find if there's a match associated with this conversation
  const associatedMatch = matches.find(m => m.chatId === activeConversation?.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 font-sans">
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
          <p className="text-sm text-gray-500 mt-1">Student-to-student direct messaging</p>
        </div>
      </div>

      {/* Main Grid Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[640px]">
        
        {/* Left Side: Conversation List */}
        <div className="lg:col-span-4 border-r border-gray-100 flex flex-col h-full bg-white min-h-0">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-50 relative shrink-0">
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
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 min-h-0">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 font-medium space-y-1">
                <p className="font-semibold text-gray-500">No conversations yet</p>
                <p className="text-[11px] text-gray-400">Chats appear here once a message is sent or received.</p>
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
        <div className="lg:col-span-8 flex flex-col h-full bg-gray-50/30 min-h-0">
          {activeConversation ? (
            <>
              {/* Active Conversation Header */}
              <ChatHeader
                conversation={activeConversation}
                associatedMatch={associatedMatch}
                onConfirmMatchInChat={onConfirmMatchInChat}
              />

              {/* Message History area (Scrollable vertically without jumping the window page) */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                {activeConversation.messages && activeConversation.messages.length > 0 ? (
                  activeConversation.messages.map((msg) => (
                    <ChatMessageItem key={msg.id} message={msg} currentUser={currentUser} />
                  ))
                ) : (
                  <div className="py-20 text-center text-gray-400 text-xs font-medium space-y-2">
                    <MessageSquare className="w-10 h-10 text-blue-500/40 mx-auto" />
                    <p className="font-bold text-gray-800 text-sm">Start the Conversation</p>
                    <p className="text-gray-500 max-w-xs mx-auto">
                      Send a message below to coordinate item verification and recovery with the finder.
                    </p>
                  </div>
                )}
              </div>

              {/* Selected Image Attachment Preview Bar */}
              {selectedImage && (
                <div className="bg-blue-50/70 border-t border-gray-100 p-3 px-6 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedImage}
                      alt="Attachment preview"
                      className="w-12 h-12 object-cover rounded-lg border border-blue-200 shadow-sm"
                    />
                    <div>
                      <p className="text-xs font-bold text-blue-900">Image attached</p>
                      <p className="text-[10px] text-blue-600">Ready to send with message</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 hover:bg-blue-100 rounded-full text-blue-700 transition-colors cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Hidden File Input for Picture Upload */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Message Input Footer Form */}
              <form
                onSubmit={handleSend}
                className="bg-white border-t border-gray-100 p-4 px-6 flex items-center gap-3 shrink-0"
              >
                {/* Photo Upload Trigger Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
                  title="Upload picture"
                >
                  <Image className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-800 shadow-inner"
                />
                
                <button
                  type="submit"
                  disabled={!inputText.trim() && !selectedImage}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-white transition-all shadow-md shrink-0 cursor-pointer ${
                    (inputText.trim() || selectedImage)
                      ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-2">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-700 text-base">No Active Conversations</p>
              <p className="text-xs text-gray-400 max-w-sm">
                Click "Message Finder" on a matched item card from your Dashboard to initiate a direct chat.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
