import React, { useState } from 'react';
import {
  ShieldAlert,
  UserX,
  UserCheck,
  Trash2,
  CheckCircle,
  Search,
  AlertTriangle,
  Package,
  Users,
  Shield,
  Sparkles,
  Key,
  Check,
  X
} from 'lucide-react';

export default function AdminPanel({
  items = [],
  users = [],
  matches = [],
  onRemoveItem = () => {},
  onDismissFlag = () => {},
  onToggleBanUser = () => {},
  onUpdateMatchStatus = () => {}
}) {
  const [activeSubTab, setActiveSubTab] = useState('flagged');
  const [userSearch, setUserSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const flaggedItems = items.filter(i => i.isFlagged);
  const activeItemsCount = items.filter(i => i.status === 'active').length;
  const resolvedItemsCount = items.filter(i => i.status === 'resolved').length;
  const bannedUsersCount = users.filter(u => u.isBanned).length;

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.matricNumber || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAllItems = items.filter(i =>
    (i.title || '').toLowerCase().includes(itemSearch.toLowerCase()) ||
    (i.description || '').toLowerCase().includes(itemSearch.toLowerCase()) ||
    (i.location || '').toLowerCase().includes(itemSearch.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 font-sans">
      {/* Superadmin Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">OAU Superadmin Moderation Portal</h1>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-mono font-bold uppercase border border-blue-400/30">
                LIVE DB OVERVIEW
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Full administrative oversight: Manage student accounts, inspect listings, review AI matches, and enforce moderation.</p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 bg-blue-500/10 text-blue-300 border border-blue-400/20 rounded-lg text-xs font-bold font-mono shrink-0">
          ROLE: SUPERADMINISTRATOR
        </div>
      </div>

      {/* Analytics Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Flagged Queue</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{flaggedItems.length}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Listings reported for review</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Students</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{users.length}</p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">{bannedUsersCount} deactivated/banned</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Listings</span>
            <Package className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{items.length}</p>
          <p className="text-[11px] text-green-600 font-medium mt-1">{activeItemsCount} active on platform</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">AI Similarity Matches</span>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{matches.length}</p>
          <p className="text-[11px] text-purple-600 font-medium mt-1">Generated by matching engine</p>
        </div>
      </div>

      {/* Main Admin Tab navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('flagged')}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeSubTab === 'flagged'
                ? 'border-amber-600 text-amber-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Flagged Queue ({flaggedItems.length})
          </button>

          <button
            onClick={() => setActiveSubTab('users')}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeSubTab === 'users'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Student Users ({users.length})
          </button>

          <button
            onClick={() => setActiveSubTab('all-items')}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeSubTab === 'all-items'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Package className="w-4 h-4" />
            All Item Listings ({items.length})
          </button>

          <button
            onClick={() => setActiveSubTab('matches')}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeSubTab === 'matches'
                ? 'border-purple-600 text-purple-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Similarity Matches ({matches.length})
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 bg-gray-50/50">

          {/* 1. FLAGGED ITEMS QUEUE */}
          {activeSubTab === 'flagged' && (
            <div>
              {flaggedItems.length === 0 ? (
                <div className="py-16 text-center text-gray-400 space-y-2">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="font-bold text-gray-800 text-base">No flagged listings</h3>
                  <p className="text-xs text-gray-400">All campus listings currently comply with safety guidelines.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flaggedItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold uppercase">
                            FLAGGED
                          </span>
                          <span className="text-xs text-gray-400 font-mono">ID: {item.id}</span>
                          <span className="text-xs text-gray-400 font-medium">Type: {item.type}</span>
                        </div>
                        <h4 className="font-extrabold text-gray-900 text-base">{item.title}</h4>
                        <p className="text-xs text-gray-600">{item.description}</p>
                        <p className="text-xs text-amber-700 font-medium mt-1">
                          Reason: {item.flagReason || 'Reported by campus user for moderation review'}
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => onDismissFlag(item.id)}
                          className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Dismiss Flag
                        </button>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Listing
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. STUDENT USER MANAGEMENT */}
          {activeSubTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search students by name, matric, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-end"
                >
                  <Key className="w-3.5 h-3.5 text-gray-500" />
                  {showPasswords ? 'Hide Passwords' : 'Reveal Passwords'}
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase">
                    <tr>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Matric / Student ID</th>
                      <th className="py-3 px-4">OAU Student Email</th>
                      {showPasswords && <th className="py-3 px-4">Password</th>}
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Moderation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-bold text-gray-900">{u.name}</td>
                        <td className="py-3 px-4 font-mono text-gray-600">{u.matricNumber}</td>
                        <td className="py-3 px-4 text-gray-600">{u.email}</td>
                        {showPasswords && (
                          <td className="py-3 px-4 font-mono text-xs text-blue-600">
                            {u.password ? u.password : <span className="text-gray-400 italic">Not set</span>}
                          </td>
                        )}
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {u.role || 'student'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {u.isBanned ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                              BANNED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => onToggleBanUser(u.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ml-auto ${
                                u.isBanned
                                  ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              }`}
                            >
                              {u.isBanned ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" /> Unban User
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5" /> Deactivate / Ban
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. ALL ITEM LISTINGS TAB */}
          {activeSubTab === 'all-items' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Search listings by title, category, location..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {filteredAllItems.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <Package className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-xs font-bold">No item listings match your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAllItems.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                            item.type === 'lost' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                          }`}>
                            {item.type}
                          </span>
                          <div className="flex items-center gap-1">
                            {item.isFlagged && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                                FLAGGED
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{item.status}</span>
                          </div>
                        </div>

                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-32 object-cover rounded-lg mb-2 border border-gray-100"
                          />
                        )}

                        <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">Category: {item.category}</p>
                      </div>

                      <div className="pt-2 border-t border-gray-50 flex justify-between items-center text-xs">
                        <span className="text-[10px] text-gray-400 font-mono">{item.location}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. AI SIMILARITY MATCHES OVERSEER TAB */}
          {activeSubTab === 'matches' && (
            <div className="space-y-4">
              {matches.length === 0 ? (
                <div className="py-16 text-center text-gray-400 space-y-2">
                  <Sparkles className="w-12 h-12 text-purple-400 mx-auto" />
                  <h3 className="font-bold text-gray-800 text-base">No AI similarity matches generated yet</h3>
                  <p className="text-xs text-gray-400">When opposite items with Jaro-Winkler similarity $\ge 60\%$ are reported, they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map(m => (
                    <div key={m.id} className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded font-mono">
                            SCORE: {m.matchPercentage}% MATCH
                          </span>
                          <span className="text-xs text-gray-400 font-mono">Match ID: {m.id}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                            m.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            m.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {m.status}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-gray-900 text-base">
                          Matched Item: {m.matchedItemTitle || 'Item'}
                        </h4>
                        <p className="text-xs text-gray-600">Location: {m.matchedItemLocation || 'OAU Campus'} | Peer Finder: {m.finderName || 'Student'}</p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {m.status !== 'confirmed' && (
                          <button
                            onClick={() => onUpdateMatchStatus(m.id, 'confirmed')}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Confirm Match
                          </button>
                        )}
                        {m.status !== 'rejected' && (
                          <button
                            onClick={() => onUpdateMatchStatus(m.id, 'rejected')}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Reject Match
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
