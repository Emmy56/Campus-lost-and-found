import React, { useState } from 'react';
import { Bell, MessageSquare, LogOut, Layers, Shield } from 'lucide-react';
import NotificationDrawer from './NotificationDrawer.jsx';

export default function Header({
  currentUser,
  currentTab,
  onTabChange,
  onLogout,
  unreadMessagesCount,
  notifications = [],
  onMarkAllNotificationsRead = () => {},
  onNotificationClick = () => {}
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo */}
        <div 
          onClick={() => onTabChange('landing')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md group-hover:bg-blue-700 transition-colors">
            CLF
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gray-900 hidden sm:inline">Campus Lost & Found</span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'dashboard'
                ? 'text-blue-600 font-bold'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Dashboard
          </button>
          
          <button
            onClick={() => {
              if (currentUser) {
                onTabChange('report-lost');
              } else {
                onTabChange('signin');
              }
            }}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'report-lost' || currentTab === 'report-found'
                ? 'text-blue-600 font-bold'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Report item
          </button>

          <button
            onClick={() => onTabChange('find-item')}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'find-item'
                ? 'text-blue-600 font-bold'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Find item
          </button>

          <button
            onClick={() => onTabChange('about')}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'about'
                ? 'text-blue-600 font-bold'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            About
          </button>

          {/* Admin Navigation Tab */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onTabChange('admin')}
              className={`text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg shadow-sm ${
                currentTab === 'admin' ? 'ring-2 ring-blue-500' : 'opacity-90 hover:opacity-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Admin Portal
            </button>
          )}
        </nav>

        {/* Right: User Actions */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              {/* Notification Bell with Drawer */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  id="header-notification-bell"
                >
                  <Bell className="w-[22px] h-[22px]" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                <NotificationDrawer
                  notifications={notifications}
                  isOpen={showNotifications}
                  onClose={() => setShowNotifications(false)}
                  onMarkAllAsRead={onMarkAllNotificationsRead}
                  onNotificationClick={onNotificationClick}
                />
              </div>

              {/* Chat Icon */}
              <button
                onClick={() => onTabChange('messages')}
                className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <MessageSquare className="w-[22px] h-[22px]" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              {/* User Avatar & Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer flex items-center justify-center font-bold text-sm shadow-sm"
                >
                  {currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100 space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="font-extrabold text-sm text-gray-900">{currentUser.name}</p>
                        {currentUser.role === 'admin' && (
                          <span className="text-[9px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded">ADMIN</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                      <p className="text-[10px] text-gray-500 font-mono">Matric: {currentUser.matricNumber}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onTabChange('dashboard');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-gray-400" />
                      My Dashboard
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onTabChange('admin');
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-blue-600" />
                        Admin Moderation Portal
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onTabChange('signin')}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onTabChange('signup')}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
