import React, { useState, useEffect } from 'react';
import { Trophy, Users, Target, BarChart3, Award, Settings, Plus, TrendingUp, Lock, LogOut, Shield } from 'lucide-react';
import { Player, Match, Tournament, Team } from './types';
import { mockPlayers } from './data/players';
import { mockMatches } from './data/matches';
import { mockTournaments } from './data/tournaments';
import { mockTeams } from './data/teams';
import Dashboard from './components/Dashboard';
import Players from './components/Players';
import Matches from './components/Matches';
import Tournaments from './components/Tournaments';
import Statistics from './components/Statistics';
import Rankings from './components/Rankings';
import AdminLogin from './components/AdminLogin';
import PlayerDetail from './components/PlayerDetail';
import Teams from './components/Teams';
import LiveScoring from './components/LiveScoring';

const K_FACTOR = 32;

const getExpectedScore = (ratingA: number, ratingB: number): number => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

const getNewRating = (currentRating: number, actualScore: number, expectedScore: number): number => {
  return Math.round(currentRating + K_FACTOR * (actualScore - expectedScore));
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [openMatchModalOnLoad, setOpenMatchModalOnLoad] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    setPlayers(mockPlayers);
    setMatches(mockMatches);
    setTournaments(mockTournaments);
    setTeams(mockTeams);
  }, []);
  
  const addTeam = (teamName: string, captainName: string) => {
    const newTeam: Team = {
      id: teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1,
      name: teamName,
      captain: captainName,
      points8Ball: 0, matchesPlayed8Ball: 0, wins8Ball: 0,
      points9Ball: 0, matchesPlayed9Ball: 0, wins9Ball: 0,
    };
    setTeams(prev => [newTeam, ...prev]);
  };

  const addPlayer = (playerData: { name: string, teamId: number, rating: number }) => {
    const newPlayer: Player = {
      ...playerData,
      id: players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1,
      status: 'active',
      rank: players.length + 1,
      previousRating: playerData.rating,
      matches8Ball: 0, wins8Ball: 0,
      matches9Ball: 0, wins9Ball: 0,
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };

  const startNewMatch = (matchSetup: Omit<Match, 'id' | 'status' | 'date' | 'time' | 'score' | 'games' | 'points1' | 'points2'>) => {
    const player1 = players.find(p => p.id === matchSetup.player1Id);
    const player2 = players.find(p => p.id === matchSetup.player2Id);
    if (!player1 || !player2) return;

    const newMatch: Match = {
      ...matchSetup,
      id: matches.length > 0 ? Math.max(...matches.map(m => m.id)) + 1 : 1,
      player1: player1.name,
      player2: player2.name,
      points1: 0,
      points2: 0,
      games: [],
      date: new Date().toLocaleDateString('en-CA'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'in_progress',
    };
    setActiveMatch(newMatch);
  };

  const finalizeMatch = (finalizedMatch: Match) => {
    const player1 = players.find(p => p.id === finalizedMatch.player1Id);
    const player2 = players.find(p => p.id === finalizedMatch.player2Id);
    if (!player1 || !player2) return;

    const winnerId = finalizedMatch.points1 > finalizedMatch.points2 ? finalizedMatch.player1Id : finalizedMatch.player2Id;
    const gameType = finalizedMatch.gameType;

    const expectedScore1 = getExpectedScore(player1.rating, player2.rating);
    const expectedScore2 = getExpectedScore(player2.rating, player1.rating);
    const actualScore1 = winnerId === player1.id ? 1 : 0;
    const actualScore2 = winnerId === player2.id ? 1 : 0;
    const newRating1 = getNewRating(player1.rating, actualScore1, expectedScore1);
    const newRating2 = getNewRating(player2.rating, actualScore2, expectedScore2);

    const updatedPlayers = players.map(p => {
        let playerToUpdate = {...p};
        if (p.id === player1.id) {
            playerToUpdate = { ...playerToUpdate, rating: newRating1, previousRating: p.rating };
        } else if (p.id === player2.id) {
            playerToUpdate = { ...playerToUpdate, rating: newRating2, previousRating: p.rating };
        }

        if (p.id === player1.id || p.id === player2.id) {
            const isWinner = p.id === winnerId;
            if (gameType === '8-ball') {
                playerToUpdate.matches8Ball += 1;
                if (isWinner) playerToUpdate.wins8Ball += 1;
            } else {
                playerToUpdate.matches9Ball += 1;
                if (isWinner) playerToUpdate.wins9Ball += 1;
            }
        }
        return playerToUpdate;
    }).sort((a,b) => b.rating - a.rating).map((p, index) => ({ ...p, rank: index + 1 }));

    setPlayers(updatedPlayers);
    
    const updatedTeams = teams.map(t => {
        if (t.id !== player1.teamId && t.id !== player2.teamId) {
            return t;
        }

        let newTeamData = {...t};
        const isPlayer1OnThisTeam = t.id === player1.teamId;
        const isPlayer2OnThisTeam = t.id === player2.teamId;
        const isWinningTeam = (isPlayer1OnThisTeam && winnerId === player1.id) || (isPlayer2OnThisTeam && winnerId === player2.id);
        
        if (gameType === '8-ball') {
            newTeamData.matchesPlayed8Ball += 1;
            if (isWinningTeam) newTeamData.wins8Ball += 1;
            if (isPlayer1OnThisTeam) newTeamData.points8Ball += finalizedMatch.points1;
            if (isPlayer2OnThisTeam) newTeamData.points8Ball += finalizedMatch.points2;
        } else {
            newTeamData.matchesPlayed9Ball += 1;
            if (isWinningTeam) newTeamData.wins9Ball += 1;
            if (isPlayer1OnThisTeam) newTeamData.points9Ball += finalizedMatch.points1;
            if (isPlayer2OnThisTeam) newTeamData.points9Ball += finalizedMatch.points2;
        }
        return newTeamData;
    });
    setTeams(updatedTeams);

    const updatedMatch = { ...finalizedMatch, status: 'completed' as const, score: `${finalizedMatch.points1}-${finalizedMatch.points2}` };
    setMatches(prev => [updatedMatch, ...prev]);
    setActiveMatch(null);
  };

  const addTournament = (newTournamentData: Omit<Tournament, 'id' | 'players'>) => {
    const newTournament: Tournament = {
      ...newTournamentData,
      id: tournaments.length > 0 ? Math.max(...tournaments.map(t => t.id)) + 1 : 1,
      players: 0,
    };
    setTournaments(prev => [newTournament, ...prev]);
  };

  const handleSelectPlayer = (playerId: number) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setSelectedPlayer(player);
    }
  };

  const handleDeselectPlayer = () => {
    setSelectedPlayer(null);
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'teams', label: 'Teams', icon: Shield },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'matches', label: 'Matches', icon: Target },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'rankings', label: 'Rankings', icon: Award },
    { id: 'statistics', label: 'Statistics', icon: TrendingUp },
  ];

  const handleNewMatch = () => {
    setActiveTab('matches');
    setOpenMatchModalOnLoad(true);
  };

  const handleAdminLogin = () => {
    setShowAdminLogin(true);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNewMatch={handleNewMatch} onNavigate={setActiveTab} isAdmin={isAdmin} players={players} matches={matches} tournaments={tournaments} teams={teams} />;
      case 'teams':
        return <Teams teams={teams} players={players} isAdmin={isAdmin} addTeam={addTeam} />;
      case 'players':
        return <Players isAdmin={isAdmin} players={players} teams={teams} addPlayer={addPlayer} updatePlayer={updatePlayer} onSelectPlayer={handleSelectPlayer} />;
      case 'matches':
        return <Matches isAdmin={isAdmin} players={players} teams={teams} tournaments={tournaments} matches={matches} startNewMatch={startNewMatch} addTournament={addTournament} openModalOnLoad={openMatchModalOnLoad} setOpenModalOnLoad={setOpenMatchModalOnLoad} />;
      case 'tournaments':
        return <Tournaments isAdmin={isAdmin} tournaments={tournaments} addTournament={addTournament} />;
      case 'rankings':
        return <Rankings isAdmin={isAdmin} players={players} />;
      case 'statistics':
        return <Statistics isAdmin={isAdmin} players={players} matches={matches} tournaments={tournaments} />;
      default:
        return <Dashboard onNewMatch={handleNewMatch} onNavigate={setActiveTab} isAdmin={isAdmin} players={players} matches={matches} tournaments={tournaments} teams={teams} />;
    }
  };

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
              {!isAdmin ? (
                <button onClick={handleAdminLogin} className="btn btn-secondary flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Admin Login</span>
                </button>
              ) : (
                <button onClick={handleAdminLogout} className="btn btn-error flex items-center space-x-2">
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
        {!selectedPlayer && (
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
          {selectedPlayer ? (
            <PlayerDetail player={selectedPlayer} matches={matches} onBack={handleDeselectPlayer} />
          ) : (
            renderContent()
          )}
        </main>
      </div>
      {activeMatch && (
        <LiveScoring match={activeMatch} onFinalize={finalizeMatch} onCancel={() => setActiveMatch(null)} />
      )}
      {showAdminLogin && (
        <AdminLogin onClose={() => setShowAdminLogin(false)} onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;