import React, { Component } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Messages from './components/Messages';
import ReportForm from './components/ReportForm';
import Auth from './components/Auth';
import About from './components/About';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { useAppStore } from './hooks/useAppStore';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Campus Lost & Found ErrorBoundary]:', error, errorInfo);
  }

  handleResetSession = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl max-w-md space-y-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto font-bold text-lg">
              CLF
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Campus Lost & Found</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              A temporary browser session conflict occurred. Click below to clear stored local cache and restore the portal.
            </p>
            <button
              onClick={this.handleResetSession}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
            >
              Reset Session & Load Web App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
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

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
