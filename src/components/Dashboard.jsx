import React, { useState } from 'react';
import LoggedItemCard from './dashboard/LoggedItemCard.jsx';
import MatchCard from './dashboard/MatchCard.jsx';
import EmptyDashboardState from './dashboard/EmptyDashboardState.jsx';

export default function Dashboard({
  currentUser,
  items = [],
  matches = [],
  onStartReporting,
  onEditItem,
  onUpdateMatchStatus,
  onOpenChat
}) {
  const [activeTab, setActiveTab] = useState('logged-items');

  const myItems = items.filter(item => item.userId === currentUser?.id);
  const myMatches = matches.filter(match => 
    myItems.some(item => item.id === match.userItemId || item.id === match.matchedItemId)
  );

  const pendingMatchesCount = myMatches.filter(m => m.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 font-sans">
      {/* Dashboard Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {currentUser?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onStartReporting('lost')}
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            Report Lost Item
          </button>
          <button
            onClick={() => onStartReporting('found')}
            className="px-5 py-2.5 bg-[#00B050] hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            Report Found Item
          </button>
        </div>
      </div>

      {/* Main Tabbed Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-100 justify-between items-center px-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('logged-items')}
              className={`py-4 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer relative ${
                activeTab === 'logged-items'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              My Logged Items ({myItems.length})
            </button>
            <button
              id="tab-matches-trigger"
              onClick={() => setActiveTab('matches')}
              className={`py-4 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'matches'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              AI Matches
              {pendingMatchesCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingMatchesCount} New
                </span>
              )}
            </button>
          </div>
          <div className="text-xs font-mono text-gray-400 hidden sm:block">
            Student ID: {currentUser?.matricNumber}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 bg-[#FAFAFA]/50 min-h-[300px]">
          {activeTab === 'logged-items' ? (
            myItems.length === 0 ? (
              <EmptyDashboardState type="logged-items" onStartReporting={onStartReporting} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myItems.map(item => (
                  <LoggedItemCard key={item.id} item={item} onEditItem={onEditItem} />
                ))}
              </div>
            )
          ) : (
            myMatches.length === 0 ? (
              <EmptyDashboardState type="matches" />
            ) : (
              <div className="space-y-6">
                {myMatches.map(match => {
                  const userItem = myItems.find(i => i.id === match.userItemId || i.id === match.matchedItemId);
                  return (
                    <MatchCard
                      key={match.id}
                      match={match}
                      userItem={userItem}
                      onOpenChat={onOpenChat}
                      onUpdateMatchStatus={onUpdateMatchStatus}
                    />
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
