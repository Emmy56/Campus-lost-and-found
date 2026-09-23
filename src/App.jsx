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
      sessionStorage.clear();
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.href = window.location.origin;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl max-w-lg space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-extrabold text-sm shadow-md">
                CLF
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Campus Lost & Found</h2>
                <p className="text-xs text-gray-500">Application Error Guard</p>
              </div>
            </div>
            
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-red-700">Captured Diagnostic Details:</p>
              <p className="text-xs font-mono text-red-600 break-words">{this.state.error?.toString()}</p>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Click below to clear stored local browser cache and reload the portal cleanly.
            </p>
            <button
              onClick={this.handleResetSession}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
            >
              Clear Cache & Restore Portal
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
