import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import OfflineBanner from './components/OfflineBanner';
import HomePage from './pages/HomePage';
import PurchasesPage from './pages/PurchasesPage';
import UploadStudioPage from './pages/UploadStudioPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PlayerPage from './pages/PlayerPage';
import AdminUsersPage from './pages/AdminUsersPage';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { isDarkMode } = useTheme();

  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShow, setSelectedShow] = useState(null);
  const [previousTab, setPreviousTab] = useState('home');

  const handlePlayShow = (show) => {
    setSelectedShow(show);
    setPreviousTab(activeTab === 'player' ? 'home' : activeTab);
    setActiveTab('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromPlayer = () => {
    setSelectedShow(null);
    setActiveTab(previousTab || 'home');
  };

  const handleLoginSuccess = () => {
    setActiveTab('home');
  };

  const handleSignupSuccess = () => {
    setActiveTab('home');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#070A13] text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-200 flex flex-col font-sans selection:bg-indigo-500 selection:text-white`}>
      {/* 🔝 1. Sticky Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (activeTab === 'player') setSelectedShow(null);
          setActiveTab(tab);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 📱 2. Main Layout (Sidebar + Content Viewport) */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Left Responsive Navigation Rail */}
        {activeTab !== 'player' && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              if (activeTab === 'player') setSelectedShow(null);
              setActiveTab(tab);
            }}
          />
        )}

        {/* Dynamic Main Viewport */}
        <main className="flex-1 min-w-0">
          {activeTab === 'home' && (
            <HomePage
              searchQuery={searchQuery}
              onPlayShow={handlePlayShow}
              onOpenLogin={() => setActiveTab('login')}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchasesPage
              onPlayShow={handlePlayShow}
              onExploreHome={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'upload' && (
            isAuthenticated ? (
              <UploadStudioPage
                onShowUploaded={() => {}}
              />
            ) : (
              <LoginPage
                onNavigateToSignup={() => setActiveTab('signup')}
                onLoginSuccess={() => setActiveTab('upload')}
              />
            )
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              onExploreHome={() => setActiveTab('home')}
              onOpenPurchases={() => setActiveTab('purchases')}
            />
          )}

          {(activeTab === 'admin-users' || activeTab === 'admin-feedback') && (
            isAdmin ? (
              <AdminUsersPage
                initialTab={activeTab === 'admin-feedback' ? 'reviews' : 'users'}
                onExploreHome={() => setActiveTab('home')}
              />
            ) : (
              <HomePage
                searchQuery={searchQuery}
                onPlayShow={handlePlayShow}
                onOpenLogin={() => setActiveTab('login')}
              />
            )
          )}

          {activeTab === 'login' && (
            <LoginPage
              onNavigateToSignup={() => setActiveTab('signup')}
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {activeTab === 'signup' && (
            <SignupPage
              onNavigateToLogin={() => setActiveTab('login')}
              onSignupSuccess={handleSignupSuccess}
            />
          )}

          {activeTab === 'player' && selectedShow && (
            <PlayerPage
              show={selectedShow}
              onBack={handleBackFromPlayer}
            />
          )}
        </main>
      </div>

      {/* 🌐 3. Real-Time Offline Connectivity Alert */}
      <OfflineBanner />
    </div>
  );
}
