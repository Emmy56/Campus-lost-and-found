import { useState, useEffect } from 'react';
import { defaultUser, defaultAdmin } from '../data/mockData.js';
import { api } from '../services/api.js';
import { computeItemMatchScore } from '../utils/matchingEngine.js';

export function useAppStore() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('clf_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return (parsed && (parsed.id || parsed.email)) ? parsed : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState(() => {
    try {
      const savedUser = localStorage.getItem('clf_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user && (user.id || user.email)) {
          return user.role === 'admin' ? 'admin' : 'dashboard';
        }
      }
    } catch (e) {}
    return 'signin';
  });

  const [users, setUsers] = useState([defaultUser, defaultAdmin]);

  // Sync state to localStorage whenever changed
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('clf_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('clf_user');
    }
  }, [currentUser]);
  
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('clf_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [matches, setMatches] = useState(() => {
    try {
      const saved = localStorage.getItem('clf_matches');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('clf_conversations');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('clf_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeConversationId, setActiveConversationId] = useState('');
  const [reportType, setReportType] = useState('lost');
  const [dashboardSubTab, setDashboardSubTab] = useState('logged-items');

  useEffect(() => {
    localStorage.setItem('clf_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('clf_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('clf_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('clf_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Load live data from Cloud Firestore Backend API
  const loadDbData = async () => {
    try {
      const [fetchedItems, fetchedMatches, fetchedConvs, fetchedNotifs, fetchedUsers] = await Promise.all([
        api.getItems().catch(() => []),
        api.getMatches().catch(() => []),
        api.getConversations().catch(() => []),
        api.getNotifications().catch(() => []),
        api.getAdminUsers().catch(() => [defaultUser, defaultAdmin])
      ]);

      if (fetchedItems && fetchedItems.length > 0) {
        setItems(fetchedItems);
      }

      if (fetchedMatches && fetchedMatches.length > 0) {
        setMatches(fetchedMatches);
      }

      if (fetchedConvs && fetchedConvs.length > 0) {
        setConversations(prevConvs => {
          if (!prevConvs || prevConvs.length === 0) return fetchedConvs;

          const fetchedMap = new Map(fetchedConvs.map(c => [c.id, c]));

          const merged = fetchedConvs.map(fetchedC => {
            const prevC = prevConvs.find(p => p.id === fetchedC.id);
            if (!prevC || !prevC.messages || prevC.messages.length === 0) return { ...prevC, ...fetchedC };

            // Retain local optimistic messages that haven't been indexed/returned by backend API yet
            const fetchedMsgIds = new Set((fetchedC.messages || []).map(m => m.id));
            const pendingOptimisticMsgs = (prevC.messages || []).filter(m => 
              !fetchedMsgIds.has(m.id) && 
              !(fetchedC.messages || []).some(fm => fm.text === m.text && fm.senderId === m.senderId && fm.timestamp === m.timestamp)
            );

            const mergedMsgs = [...(fetchedC.messages || []), ...pendingOptimisticMsgs];
            const lastMsg = mergedMsgs[mergedMsgs.length - 1];

            return {
              ...prevC,
              ...fetchedC,
              messages: mergedMsgs,
              lastMessageText: lastMsg?.text || (lastMsg?.image ? '📷 Sent an image' : (fetchedC.lastMessageText || prevC.lastMessageText)),
              lastMessageTime: lastMsg?.timestamp || fetchedC.lastMessageTime || prevC.lastMessageTime
            };
          });

          // Retain local client-side conversations that backend API hasn't returned yet
          for (const prevC of prevConvs) {
            if (prevC && !fetchedMap.has(prevC.id)) {
              merged.push(prevC);
            }
          }

          return merged;
        });
      }

      if (fetchedNotifs && fetchedNotifs.length > 0) {
        setNotifications(prevNotifs => {
          if (!prevNotifs || prevNotifs.length === 0) return fetchedNotifs;
          const readIds = new Set(prevNotifs.filter(n => n.read).map(n => n.id));
          return fetchedNotifs.map(n => ({
            ...n,
            read: n.read || readIds.has(n.id)
          }));
        });
      }

      if (fetchedUsers && fetchedUsers.length > 0) {
        setUsers(fetchedUsers);
      }

      if (fetchedConvs && fetchedConvs.length > 0 && !activeConversationId) {
        const convWithMsgs = fetchedConvs.find(c => c.messages && c.messages.length > 0);
        if (convWithMsgs) {
          setActiveConversationId(convWithMsgs.id);
        }
      }
    } catch (err) {
      console.warn('[Store] API Connection error, maintaining local state:', err);
    }
  };

  useEffect(() => {
    loadDbData();
    const interval = setInterval(loadDbData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('clf_user');
    localStorage.removeItem('clf_items');
    localStorage.removeItem('clf_matches');
    localStorage.removeItem('clf_conversations');
    localStorage.removeItem('clf_notifications');
    setItems([]);
    setMatches([]);
    setConversations([]);
    setNotifications([]);
    setCurrentTab('signin');
  };

  const handleLogin = async (user) => {
    let dbUser = null;
    const cleanEmail = (user.email || '').toLowerCase().trim();
    const isSuperadmin = cleanEmail === 'admin@student.oauife.edu.ng' || cleanEmail === 'admin' || cleanEmail === 'admin/oau/001' || cleanEmail.includes('admin');

    if (!user.name && isSuperadmin) {
      if (user.password !== 'admin001') {
        throw new Error('Incorrect password for Superadmin account. (Expected password: admin001)');
      }
      try {
        dbUser = await api.login(cleanEmail, user.password);
      } catch (err) {
        console.warn('[Auth] API login warning, falling back to local superadmin:', err);
        dbUser = defaultAdmin;
      }
      if (!dbUser) dbUser = defaultAdmin;
    } else {
      if (user.name) {
        // Register mode - throws Error if duplicate matric or email
        dbUser = await api.register(user);
      } else {
        // Login mode - throws Error if unrecognized email or incorrect password
        try {
          dbUser = await api.login(user.email, user.password);
        } catch (err) {
          const localFound = users.find(u => u.email?.toLowerCase() === cleanEmail || u.matricNumber?.toLowerCase() === cleanEmail);
          if (localFound) {
            if (localFound.password && user.password && localFound.password !== user.password) {
              throw new Error('Incorrect password. Please check your credentials.');
            }
            dbUser = localFound;
          } else {
            throw err;
          }
        }
      }
    }
    
    if (!dbUser) {
      throw new Error('Authentication failed. Incorrect email or password.');
    }

    // Safety guard: ensure ONLY admin@student.oauife.edu.ng can hold admin role
    if (dbUser.email?.toLowerCase() !== 'admin@student.oauife.edu.ng' && dbUser.role === 'admin') {
      dbUser.role = 'student';
    }

    setCurrentUser(dbUser);
    setUsers(prev => {
      const exists = prev.some(u => u.id === dbUser.id || u.email === dbUser.email);
      return exists ? prev : [dbUser, ...prev];
    });
    setCurrentTab(dbUser.role === 'admin' ? 'admin' : 'dashboard');
    loadDbData();
    return dbUser;
  };

  const stats = {
    lost: items.filter(i => i.type === 'lost').length,
    found: items.filter(i => i.type === 'found').length,
    matches: matches.filter(m => m.status === 'confirmed').length + matches.length,
    matchesThisWeek: matches.length
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await api.markAllNotificationsRead().catch(() => {});
  };

  const handleNotificationClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.type === 'match' || notif.linkTab === 'dashboard') {
      setDashboardSubTab('matches');
      setCurrentTab('dashboard');
    } else if (notif.linkTab) {
      setCurrentTab(notif.linkTab);
    }
  };

  const handleUpdateItem = async (itemId, updatedData) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, ...updatedData } : i));
    await api.updateItem(itemId, updatedData).catch(() => {});
    loadDbData();
  };

  const handleUpdateMatchStatus = async (matchId, status) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status } : m));
    await api.updateMatchStatus(matchId, status).catch(() => {});
    loadDbData();
  };

  const handleSendMessage = async (conversationId, text, image = null) => {
    const senderName = currentUser?.name || 'Student';
    const senderId = currentUser?.id || 'me';
    
    // Add message locally to conversations
    const newMsg = {
      id: 'msg-' + Date.now(),
      senderId: senderId,
      senderName: senderName,
      text: text || '',
      image: image || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessageText: text || (image ? '📷 Sent an image' : ''),
          lastMessageTime: 'Just now',
          messages: [...(c.messages || []), newMsg]
        };
      }
      return c;
    }));

    await api.sendMessage(conversationId, text, senderName, senderId, image).catch(() => {});
  };

  const handleAddReport = async (itemData) => {
    let createdItem = null;
    const authorStr = currentUser
      ? `${currentUser.name} (${currentUser.matricNumber || currentUser.email})`
      : 'OAU Student';

    try {
      const payload = {
        ...itemData,
        userId: currentUser?.id || 'user-guest',
        loggedBy: authorStr
      };
      const res = await api.createItem(payload);
      if (res && res.item) {
        createdItem = res.item;
      }
    } catch (err) {
      console.warn('[Store] Remote API sync warning:', err);
    }

    const newItem = createdItem || {
      title: itemData.title,
      description: itemData.description,
      itemType: itemData.type === 'lost' ? 'Lost Item' : 'Found Item',
      type: itemData.type,
      loggedBy: authorStr,
      category: itemData.category,
      location: itemData.location,
      specificLocation: itemData.specificLocation || '',
      date: itemData.date,
      time: itemData.time || '',
      status: 'active',
      id: 'item-' + Date.now(),
      userId: currentUser?.id || 'user-' + Date.now(),
      reward: itemData.reward || '',
      image: itemData.image || null,
      isFlagged: false,
      flagReason: '',
      createdAt: new Date().toISOString()
    };

    // Single item update ensuring no duplicate by ID
    setItems(prev => [newItem, ...prev.filter(i => i.id !== newItem.id)]);

    // Calculate AI similarity match against existing items in state
    const oppositeItems = items.filter(i => i.id !== newItem.id && i.type !== newItem.type && i.status === 'active');
    let bestMatchItem = null;
    let highestScore = 0;

    for (const target of oppositeItems) {
      const score = computeItemMatchScore(newItem, target);
      if (score > highestScore) {
        highestScore = score;
        bestMatchItem = target;
      }
    }

    // ONLY generate a match if an actual matching opposite item exists with score >= 60
    if (bestMatchItem && highestScore >= 60) {
      const mockMatchId = 'match-' + Date.now();
      const mockChatId = 'chat-match-' + mockMatchId;

      const isNewItemLost = newItem.type === 'lost';
      
      const finderUserId = isNewItemLost ? (bestMatchItem.userId || 'user-finder') : (currentUser?.id || 'guest');
      const finderNameStr = isNewItemLost ? (bestMatchItem.loggedBy || 'Student Finder') : authorStr;
      
      const loserUserId = isNewItemLost ? (currentUser?.id || 'guest') : (bestMatchItem.userId || 'user-loser');
      const loserNameStr = isNewItemLost ? authorStr : (bestMatchItem.loggedBy || 'Student Loser');

      const foundItemTitle = isNewItemLost ? bestMatchItem.title : newItem.title;

      const newMatch = {
        id: mockMatchId,
        chatId: mockChatId,
        userItemId: newItem.id,
        userItemTitle: newItem.title,
        matchedItemId: bestMatchItem.id,
        matchedItemTitle: bestMatchItem.title,
        matchedItemType: bestMatchItem.type === 'lost' ? 'Lost Item' : 'Found Item',
        matchedItemLocation: bestMatchItem.location,
        matchPercentage: highestScore,
        status: 'pending',
        finderName: finderNameStr,
        finderId: finderUserId,
        loserName: loserNameStr,
        loserId: loserUserId,
        createdAt: new Date().toISOString()
      };

      const newConv = {
        id: mockChatId,
        matchId: mockMatchId,
        userItemId: newItem.id,
        matchedItemId: bestMatchItem.id,
        finderId: finderUserId,
        finderName: finderNameStr,
        loserId: loserUserId,
        loserName: loserNameStr,
        title: `Finder: ${finderNameStr} (${foundItemTitle})`,
        lastMessageText: '',
        lastMessageTime: 'Just now',
        unreadCount: 0,
        participants: [
          { id: finderUserId, name: finderNameStr, role: 'finder', online: false },
          { id: loserUserId, name: loserNameStr, role: 'loser', online: false }
        ],
        messages: [],
        createdAt: new Date().toISOString()
      };

      const newNotif = {
        title: 'Match Detected!',
        message: `Your report "${newItem.title}" has a ${highestScore}% match with "${bestMatchItem.title}" found by ${finderNameStr}.`,
        userId: currentUser?.id || 'guest',
        type: 'match',
        timestamp: new Date().toISOString(),
        read: false,
        linkTab: 'dashboard',
        id: 'notif-' + Date.now(),
        createdAt: new Date().toISOString()
      };

      setMatches(prev => [newMatch, ...prev.filter(m => m.id !== newMatch.id)]);
      setConversations(prev => [newConv, ...prev.filter(c => c.id !== newConv.id)]);
      setNotifications(prev => [newNotif, ...prev.filter(n => n.id !== newNotif.id)]);
    }

    // Switch view to dashboard immediately
    setCurrentTab('dashboard');
    loadDbData();
  };

  const handleFlagItem = async (itemId, reason) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, isFlagged: true, flagReason: reason || 'Flagged by user' } : i));
    await api.flagItem(itemId, reason).catch(() => {});
  };

  const handleDismissFlag = async (itemId) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, isFlagged: false } : i));
    await api.dismissFlag(itemId).catch(() => {});
  };

  const handleRemoveItem = async (itemId) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
    await api.deleteItem(itemId).catch(() => {});
  };

  const handleToggleBanUser = async (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: !u.isBanned } : u));
    await api.toggleBanUser(userId).catch(() => {});
  };

  const handleOpenChat = (chatId, match = null) => {
    setActiveConversationId(chatId);
    setConversations(prev => {
      const exists = prev.some(c => c.id === chatId);
      if (exists) {
        return prev.map(c => {
          if (c.id === chatId) {
            return {
              ...c,
              unreadCount: 0,
              messages: (c.messages || []).map(m => ({ ...m, isRead: true }))
            };
          }
          return c;
        });
      }

      // Dynamically create a distinct conversation specifically for this match and finder
      const targetMatch = match || matches.find(m => m.chatId === chatId || m.id === chatId);
      const finderName = targetMatch?.finderName || 'Student Finder';
      const finderId = targetMatch?.finderId || `user-finder-${Date.now()}`;
      const loserName = targetMatch?.loserName || currentUser?.name || 'Student Peer';
      const loserId = targetMatch?.loserId || currentUser?.id || 'user-loser';
      const matchedTitle = targetMatch?.matchedItemTitle || targetMatch?.userItemTitle || 'Matched Item';

      const newMatchConv = {
        id: chatId,
        matchId: targetMatch?.id || chatId,
        title: `Finder: ${finderName} (${matchedTitle})`,
        unreadCount: 0,
        lastMessageText: `Hi! Direct chat initiated with finder ${finderName} regarding: ${matchedTitle}`,
        lastMessageTime: 'Just now',
        finderId: finderId,
        finderName: finderName,
        loserId: loserId,
        loserName: loserName,
        participants: [
          { id: finderId, name: finderName, role: 'finder', online: false },
          { id: loserId, name: loserName, role: 'loser', online: false }
        ],
        messages: [
          {
            id: 'msg-init-' + Date.now(),
            senderId: 'system',
            senderName: 'System',
            text: `Dedicated private conversation created exclusively with Finder "${finderName}" for "${matchedTitle}".`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: true
          }
        ],
        createdAt: new Date().toISOString()
      };

      api.createConversation(newMatchConv).catch(() => {});

      return [newMatchConv, ...prev];
    });
    setCurrentTab('messages');
  };

  const handleConnectFromFind = (item) => {
    if (!currentUser) {
      setCurrentTab('signin');
      return;
    }

    const chatId = `chat-finder-${item.id}-${currentUser.id}`;
    const existing = conversations.find(c => c.id === chatId);
    if (existing) {
      handleOpenChat(chatId);
      return;
    }

    const finderName = item.loggedBy || 'Student Finder';
    const finderId = item.userId || `user-finder-${Date.now()}`;

    const newConversation = {
      id: chatId,
      title: `Finder: ${finderName} (${item.title})`,
      unreadCount: 0,
      lastMessageText: `Hi ${finderName}! I saw your item listing: ${item.title}`,
      lastMessageTime: 'Just now',
      finderId: finderId,
      finderName: finderName,
      loserId: currentUser?.id,
      loserName: currentUser?.name,
      participants: [
        { id: finderId, name: finderName, role: 'finder', online: false },
        { id: currentUser.id, name: currentUser.name || 'Student', role: 'loser', online: true }
      ],
      messages: [
        {
          id: 'msg-con-' + Date.now(),
          senderId: currentUser?.id || 'me',
          senderName: currentUser?.name || 'Student',
          text: `Hi ${finderName}! I saw your report about "${item.title}" at ${item.location}. I'd like to check if this is the correct item. Let me know when you're available to meet up!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      createdAt: new Date().toISOString()
    };

    api.createConversation(newConversation).catch(() => {});

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(chatId);
    setCurrentTab('messages');
  };

  const isUserAdmin = currentUser?.role === 'admin';

  const validItems = (items || []).filter(Boolean);
  const validMatches = (matches || []).filter(Boolean);
  const validConversations = (conversations || []).filter(Boolean);
  const validNotifications = (notifications || []).filter(Boolean);

  const userItems = isUserAdmin
    ? validItems
    : validItems.filter(i => i && i.userId === currentUser?.id);

  const userMatches = isUserAdmin
    ? validMatches
    : validMatches.filter(m => m && (userItems || []).some(i => i && (i.id === m.userItemId || i.id === m.matchedItemId)));

  const userConversations = isUserAdmin
    ? []
    : validConversations.filter(c => c && (
        c.finderId === currentUser?.id ||
        c.loserId === currentUser?.id ||
        (userMatches || []).some(m => m && (m.chatId === c.id || m.id === c.matchId)) ||
        (c.participants && c.participants.some(p => p && (p.id === currentUser?.id || p.id === 'me')))
      ));

  const userNotifications = isUserAdmin
    ? validNotifications
    : validNotifications.filter(n => n && n.userId === currentUser?.id);

  const unreadMessagesCount = (userConversations || []).reduce((acc, conv) => {
    if (conv?.messages && Array.isArray(conv.messages) && conv.messages.length > 0) {
      const unread = conv.messages.filter(m => 
        !m.isRead && m.senderId !== 'me' && m.senderId !== currentUser?.id && m.senderId !== 'system'
      ).length;
      return acc + unread;
    }
    return acc + (conv?.unreadCount || 0);
  }, 0);

  return {
    currentUser,
    users,
    currentTab,
    setCurrentTab,
    items: userItems,
    matches: userMatches,
    conversations: userConversations,
    notifications: userNotifications,
    rawItems: items,
    activeConversationId,
    setActiveConversationId,
    reportType,
    setReportType,
    dashboardSubTab,
    setDashboardSubTab,
    stats,
    unreadMessagesCount,
    handleLogin,
    handleLogout,
    handleUpdateMatchStatus,
    handleSendMessage,
    handleAddReport,
    handleUpdateItem,
    handleFlagItem,
    handleDismissFlag,
    handleRemoveItem,
    handleToggleBanUser,
    handleMarkAllNotificationsRead,
    handleNotificationClick,
    handleOpenChat,
    handleConnectFromFind
  };
}
