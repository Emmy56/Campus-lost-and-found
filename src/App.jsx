import React from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Messages from './components/Messages';
import ReportForm from './components/ReportForm';
import Auth from './components/Auth';
import About from './components/About';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { useAppStore } from './hooks/useAppStore';

export default function App() {
  const {
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
    setReportType,
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
    handleOpenChat
  } = useAppStore();

  const protectedTabs = ['dashboard', 'messages', 'report-lost', 'report-found', 'admin'];
  const activeTab = (!currentUser && protectedTabs.includes(currentTab)) ? 'signin' : currentTab;

  const handleTabChange = (tab) => {
    if (tab === 'landing') {
      setCurrentTab(currentUser ? 'dashboard' : 'signin');
      return;
    }
    if (!currentUser && protectedTabs.includes(tab)) {
      setCurrentTab('signin');
    } else {
      setCurrentTab(tab);
    }
  };

  const handleStartReporting = (type) => {
    if (!currentUser) {
      setCurrentTab('signin');
    } else {
      setReportType(type);
      setCurrentTab(type === 'lost' ? 'report-lost' : 'report-found');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
      <div>
        {/* Header Navigation */}
        <Header
          currentUser={currentUser}
          currentTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
          unreadMessagesCount={unreadMessagesCount}
          notifications={notifications}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onNotificationClick={handleNotificationClick}
        />

        {/* Dynamic Route Switch Panel */}
        <main className="animate-fade-in duration-300">
          {activeTab === 'dashboard' && currentUser && (
            <Dashboard
              currentUser={currentUser}
              items={items}
              matches={matches}
              onStartReporting={handleStartReporting}
              onEditItem={(item) => alert(`Editing "${item.title}" details.`)}
              onUpdateMatchStatus={handleUpdateMatchStatus}
              onOpenChat={handleOpenChat}
            />
          )}

          {activeTab === 'messages' && currentUser && (
            <Messages
              currentUser={currentUser}
              conversations={conversations}
              matches={matches}
              activeConversationId={activeConversationId}
              onSelectConversation={(id) => setActiveConversationId(id)}
              onSendMessage={handleSendMessage}
              onConfirmMatchInChat={(matchId) => handleUpdateMatchStatus(matchId, 'confirmed')}
              onBackToDashboard={() => setCurrentTab('dashboard')}
            />
          )}

          {activeTab === 'report-lost' && currentUser && (
            <ReportForm
              type="lost"
              onCancel={() => setCurrentTab('dashboard')}
              onSubmit={handleAddReport}
            />
          )}

          {activeTab === 'report-found' && currentUser && (
            <ReportForm
              type="found"
              onCancel={() => setCurrentTab('dashboard')}
              onSubmit={handleAddReport}
            />
          )}

          {activeTab === 'signin' && (
            <Auth
              initialScreen="signin"
              onAuthSuccess={handleLogin}
              onSwitchScreen={(screen) => setCurrentTab(screen)}
            />
          )}

          {activeTab === 'signup' && (
            <Auth
              initialScreen="signup"
              onAuthSuccess={handleLogin}
              onSwitchScreen={(screen) => setCurrentTab(screen)}
            />
          )}

          {activeTab === 'about' && <About />}

          {activeTab === 'admin' && currentUser?.role === 'admin' && (
            <AdminPanel
              items={items}
              users={users}
              matches={matches}
              onFlagItem={handleFlagItem}
              onRemoveItem={handleRemoveItem}
              onDismissFlag={handleDismissFlag}
              onToggleBanUser={handleToggleBanUser}
              onUpdateMatchStatus={handleUpdateMatchStatus}
            />
          )}
        </main>
      </div>

      {/* Footer Block */}
      <Footer />
    </div>
  );
}
