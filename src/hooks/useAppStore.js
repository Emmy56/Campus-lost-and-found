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

  // Sync state to localStorage whenever changed
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('clf_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('clf_user');
    }
  }, [currentUser]);

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
        setConversations(fetchedConvs);
      }

      if (fetchedNotifs && fetchedNotifs.length > 0) {
        setNotifications(fetchedNotifs);
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
    if (user.name) {
      // Register mode - throws Error if duplicate matric or email
      dbUser = await api.register(user);
    } else {
      // Login mode - throws Error if unrecognized email or incorrect password
      dbUser = await api.login(user.email, user.password);
    }
    
    if (!dbUser) {
      throw new Error('Authentication failed. Incorrect email or password.');
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
    if (notif.linkTab) {
      setCurrentTab(notif.linkTab);
    }
  };

  const handleUpdateMatchStatus = async (matchId, status) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status } : m));
    await api.updateMatchStatus(matchId, status).catch(() => {});
    loadDbData();
  };

  const handleSendMessage = async (conversationId, text) => {
    const senderName = currentUser?.name || 'Student';
    const senderId = currentUser?.id || 'me';
    
    // Add message locally to conversations
    const newMsg = {
      id: 'msg-' + Date.now(),
      senderId: senderId,
      senderName: senderName,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessageText: text,
          lastMessageTime: 'Just now',
          messages: [...(c.messages || []), newMsg]
        };
      }
      return c;
    }));

    await api.sendMessage(conversationId, text, senderName, senderId).catch(() => {});
    loadDbData();
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
      const mockChatId = 'chat-' + Date.now();

      const newMatch = {
        matchedItemTitle: bestMatchItem.title,
        matchedItemType: bestMatchItem.type === 'lost' ? 'Lost Item' : 'Found Item',
        matchedItemLocation: bestMatchItem.location,
        matchPercentage: highestScore,
        status: 'pending',
        finderName: 'Student Peer',
        userItemId: newItem.id,
        matchedItemId: bestMatchItem.id,
        chatId: mockChatId,
        id: mockMatchId,
        createdAt: new Date().toISOString()
      };

      const newConv = {
        title: `Re: ${newItem.title}`,
        lastMessageText: '',
        lastMessageTime: 'Just now',
        matchId: mockMatchId,
        unreadCount: 0,
        participants: [{ id: bestMatchItem.userId || 'user-peer', name: 'Student Peer', online: true }],
        messages: [],
        id: mockChatId,
        createdAt: new Date().toISOString()
      };

      const newNotif = {
        title: 'AI Similarity Match Detected!',
        message: `Your report "${newItem.title}" has a ${highestScore}% Jaro-Winkler match with "${bestMatchItem.title}".`,
        userId: currentUser?.id || 'guest',
        type: 'match',
        timestamp: 'Just now',
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

  const handleOpenChat = (chatId) => {
    setActiveConversationId(chatId);
    setConversations(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c));
    setCurrentTab('messages');
  };

  const handleConnectFromFind = (item) => {
    if (!currentUser) {
      setCurrentTab('signin');
      return;
    }

    const chatId = `chat-find-${item.id}`;
    const existing = conversations.find(c => c.id === chatId);
    if (existing) {
      handleOpenChat(chatId);
      return;
    }

    const newConversation = {
      id: chatId,
      title: `Re: ${item.title}`,
      unreadCount: 0,
      lastMessageText: `Hi! I'm interested in coordinating details about: ${item.title}`,
      lastMessageTime: 'Just now',
      participants: [
        {
          id: item.userId,
          name: 'Student Partner',
          avatar: '',
          online: false
        }
      ],
      messages: [
        {
          id: 'msg-con-' + Date.now(),
          senderId: 'me',
          senderName: currentUser?.name || 'Student',
          text: `Hi! I saw your report about the ${item.title} at ${item.location}. I'd like to check if this is the correct item. Let me know when you're available to meet up!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(chatId);
    setCurrentTab('messages');
  };

  const isUserAdmin = currentUser?.role === 'admin';

  const userItems = isUserAdmin
    ? items
    : items.filter(i => i.userId === currentUser?.id);

  const userMatches = isUserAdmin
    ? matches
    : matches.filter(m => userItems.some(i => i.id === m.userItemId || i.id === m.matchedItemId));

  const userConversations = isUserAdmin
    ? conversations
    : conversations.filter(c => userMatches.some(m => m.chatId === c.id || m.id === c.matchId) || c.participants?.some(p => p.id === currentUser?.id));

  const userNotifications = isUserAdmin
    ? notifications
    : notifications.filter(n => n.userId === currentUser?.id);

  const unreadMessagesCount = userConversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

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
    stats,
    unreadMessagesCount,
    handleLogin,
    handleLogout,
    handleUpdateMatchStatus,
    handleSendMessage,
    handleAddReport,
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
