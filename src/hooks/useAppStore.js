import { useState, useEffect } from 'react';
import { defaultUser, defaultAdmin } from '../data/mockData.js';
import { api } from '../services/api.js';

export function useAppStore() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('clf_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [users, setUsers] = useState([defaultUser, defaultAdmin]);
  const [currentTab, setCurrentTab] = useState('landing');
  const [items, setItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState('');
  const [reportType, setReportType] = useState('lost');

  // Load live data from PostgreSQL / SQL Express Backend API
  const loadDbData = async () => {
    try {
      const [fetchedItems, fetchedMatches, fetchedConvs, fetchedNotifs, fetchedUsers] = await Promise.all([
        api.getItems().catch(() => []),
        api.getMatches().catch(() => []),
        api.getConversations().catch(() => []),
        api.getNotifications().catch(() => []),
        api.getAdminUsers().catch(() => [defaultUser, defaultAdmin])
      ]);

      setItems(fetchedItems);
      setMatches(fetchedMatches);
      setConversations(fetchedConvs);
      setNotifications(fetchedNotifs);
      setUsers(fetchedUsers);

      if (fetchedConvs.length > 0 && !activeConversationId) {
        setActiveConversationId(fetchedConvs[0].id);
      }
    } catch (err) {
      console.warn('[Store] API Connection error, using current state:', err);
    }
  };

  useEffect(() => {
    loadDbData();
    const interval = setInterval(loadDbData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('clf_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('clf_user');
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab('landing');
  };

  const handleLogin = async (user) => {
    setCurrentUser(user);
    setCurrentTab(user.role === 'admin' ? 'admin' : 'dashboard');
    loadDbData();
  };

  const stats = {
    lost: items.filter(i => i.type === 'lost').length,
    found: items.filter(i => i.type === 'found').length,
    matches: matches.filter(m => m.status === 'confirmed').length + matches.length,
    matchesThisWeek: matches.length
  };

  const unreadMessagesCount = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

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
    await api.sendMessage(conversationId, text, senderName).catch(() => {});
    loadDbData();
  };

  const handleAddReport = async (itemData) => {
    try {
      const payload = { ...itemData, userId: currentUser?.id || 'guest' };
      await api.createItem(payload);
      setCurrentTab('dashboard');
      setTimeout(loadDbData, 800);
    } catch (err) {
      console.error('[Store] Failed to save report to DB:', err);
    }
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
          senderName: currentUser.name,
          text: `Hi! I saw your report about the ${item.title} at ${item.location}. I'd like to check if this is the correct item. Let me know when you're available to meet up!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(chatId);
    setCurrentTab('messages');
  };

  return {
    currentUser,
    users,
    currentTab,
    setCurrentTab,
    items,
    matches,
    conversations,
    notifications,
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
