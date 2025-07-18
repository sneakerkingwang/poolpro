import React, { useState, useEffect } from 'react';
import { Trophy, Users, Target, BarChart3, Award, Settings, LogIn, LogOut, Shield, TrendingUp } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Match } from './types';

// Import Components
import Dashboard from './components/Dashboard';
import Players from './components/Players';
import Matches from './components/Matches';
import Tournaments from './components/Tournaments';
import Statistics from './components/Statistics';
import Rankings from './components/Rankings';
import Auth from './components/Auth';
import PlayerDetail from './components/PlayerDetail';
import Teams from './components/Teams';
import LiveScoring from './components/LiveScoring';

function App() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [openMatchModalOnLoad, setOpenModalOnLoad] = useState(false);
  // This state now correctly holds only the ID of the active match
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  // --- AUTHENTICATION ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAdmin(user?.email === 'weihongtamu@gmail.com'); // Your admin email
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- EVENT HANDLERS ---
  const handleSelectPlayer = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  const handleDeselectPlayer = () => {
    setSelectedPlayerId(null);
  };

  const handleNewMatch = () => {
    setActiveTab('matches');
    setOpenModalOnLoad(true);
  };

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
  };

  // This handler now correctly accepts a matchId string
  const handleMatchStarted = (matchId: string) => {
    setActiveMatchId(matchId);
  };

  const handleFinalizeLiveScoring = () => {
    setActiveMatchId(null);
    // After a match is finalized, we should probably go back to the matches tab
    setActiveTab('matches');
  };

  // --- RENDER LOGIC ---
  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'teams', label: 'Teams', icon: Shield },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'matches', label: 'Matches', icon: Target },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'rankings', label: 'Rankings', icon: Award },
    { id: 'statistics', label: 'Statistics', icon: TrendingUp },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNewMatch={handleNewMatch} onNavigate={setActiveTab} isAdmin={isAdmin} />;
      case 'teams':
        // Note: The 'players' prop is temporarily passed as an empty array.
        // A better solution would be to fetch players within Teams or use global state.
        return <Teams isAdmin={isAdmin} players={[]} />;
      case 'players':
        return <Players isAdmin={isAdmin} onSelectPlayer={handleSelectPlayer} />;
      case 'matches':
        return (
          <Matches
            isAdmin={isAdmin}
            openModalOnLoad={openMatchModalOnLoad}
            setOpenModalOnLoad={setOpenModalOnLoad}
            onMatchStarted={handleMatchStarted}
          />
        );
      case 'tournaments':
        return <Tournaments isAdmin={isAdmin} />;
      case 'rankings':
        return <Rankings isAdmin={isAdmin} />;
      case 'statistics':
        return <Statistics isAdmin={isAdmin} />;
      default:
        return <Dashboard onNewMatch={handleNewMatch} onNavigate={setActiveTab} isAdmin={isAdmin} />;
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-base-200">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-base-200">
      <header className="bg-base-100 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">PoolPro</h1>
                <p className="text-sm text-gray-500">Professional Billiard Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!currentUser ? (
                <button onClick={handleLoginClick} className="btn btn-secondary flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span>Login / Sign Up</span>
                </button>
              ) : (
                <button onClick={handleLogout} className="btn btn-error flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              )}
              <button className="text-gray-500 hover:text-primary transition-colors duration-200">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedPlayerId && (
          <nav className="mb-8">
            <div className="bg-base-100 rounded-lg shadow p-2 flex flex-wrap gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex-grow flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                      activeTab === item.id ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-base-200 hover:text-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        <main className="transition-all duration-300">
          {selectedPlayerId ? (
            <PlayerDetail playerId={selectedPlayerId} onBack={handleDeselectPlayer} />
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* This now correctly passes the ID to LiveScoring */}
      {activeMatchId && (
        <LiveScoring
          matchId={activeMatchId}
          onFinalize={handleFinalizeLiveScoring}
          onCancel={() => setActiveMatchId(null)}
        />
      )}
      
      {showAuthModal && (
        <Auth onClose={() => setShowAuthModal(false)} onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
