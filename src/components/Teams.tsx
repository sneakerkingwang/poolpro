import React, { useState, useEffect } from 'react';
import { Shield, User, Plus } from 'lucide-react';
import { Team, Player } from '../types';
import { db } from '../firebase'; 
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';

// CHANGE: The component no longer needs the `players` prop
interface TeamsProps {
  isAdmin: boolean;
}

const Teams: React.FC<TeamsProps> = ({ isAdmin }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  // NEW: Add state for players, managed within this component
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [gameType, setGameType] = useState<'8-ball' | '9-ball'>('8-ball');
  const [newTeamName, setNewTeamName] = useState('');
  const [newCaptainName, setNewCaptainName] = useState('');
  const [formError, setFormError] = useState('');

  // CHANGE: This useEffect now fetches BOTH teams and players in real-time
  useEffect(() => {
    setLoading(true);
    // Listener for Teams
    const teamsQuery = query(collection(db, "teams"), orderBy("name", "asc"));
    const unsubscribeTeams = onSnapshot(teamsQuery, (querySnapshot) => {
      const teamsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Team[];
      setTeams(teamsData);
      // Set loading to false only after the first batch of data is loaded
      if (loading) setLoading(false);
    });

    // Listener for Players
    const playersQuery = query(collection(db, "players"), orderBy("name", "asc"));
    const unsubscribePlayers = onSnapshot(playersQuery, (querySnapshot) => {
      const playersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Player[];
      setPlayers(playersData);
    });

    // Cleanup both listeners when the component unmounts
    return () => {
      unsubscribeTeams();
      unsubscribePlayers();
    };
  }, []); // The empty dependency array ensures this runs only once

  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleCloseRoster = () => {
    setSelectedTeam(null);
  };

  const handleCreateTeamSubmit = async () => {
    if (!newTeamName.trim() || !newCaptainName.trim()) {
      setFormError('Team Name and Captain Name are required.');
      return;
    }

    try {
      const newTeam = {
        name: newTeamName,
        captain: newCaptainName,
        points8Ball: 0,
        wins8Ball: 0,
        matchesPlayed8Ball: 0,
        points9Ball: 0,
        wins9Ball: 0,
        matchesPlayed9Ball: 0,
      };
      await addDoc(collection(db, "teams"), newTeam);

      setShowCreateTeamModal(false);
      setNewTeamName('');
      setNewCaptainName('');
      setFormError('');
    } catch (error) {
      console.error("Error creating new team: ", error);
      setFormError("Failed to create team. Please try again.");
    }
  };

  // This function now works correctly because the internal `players` state is populated
  const getTeamRoster = (teamId: string) => {
    return players.filter(p => p.teamId === teamId).sort((a,b) => b.rating - a.rating);
  };

  if (loading) {
    return <div className="text-center p-10 font-semibold text-gray-500">Loading teams...</div>;
  }

  // The rest of your component's JSX does not need to change.
  // I have included it here for completeness.
  if (selectedTeam) {
    const roster = getTeamRoster(selectedTeam.id);
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{selectedTeam.name} - Roster</h2>
          <button onClick={handleCloseRoster} className="btn btn-primary">Back to Teams</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">8-Ball (W-L)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">9-Ball (W-L)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {roster.length > 0 ? roster.map(player => (
                <tr key={player.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{player.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.rating}</td>
                  <td className="px-6 py-4 whitespace-nowrap">#{player.rank}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.wins8Ball || 0} - {(player.matches8Ball || 0) - (player.wins8Ball || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.wins9Ball || 0} - {(player.matches9Ball || 0) - (player.wins9Ball || 0)}
                  </td>
                </tr>
              )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500">This team has no players on its roster.</td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Teams</h2>
        <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-gray-200 p-1 rounded-lg">
                <button 
                  onClick={() => setGameType('8-ball')} 
                  className={`px-3 py-1 rounded-md text-sm font-semibold ${gameType === '8-ball' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}
                >
                  8-Ball
                </button>
                <button 
                  onClick={() => setGameType('9-ball')} 
                  className={`px-3 py-1 rounded-md text-sm font-semibold ${gameType === '9-ball' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}
                >
                  9-Ball
                </button>
            </div>
            {isAdmin && (
                <button 
                  onClick={() => setShowCreateTeamModal(true)} 
                  className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Create New Team
                </button>
            )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {teams.map(team => {
      const stats = gameType === '8-ball' 
        ? { 
            points: team.points8Ball, 
            wins: team.wins8Ball, 
            matches: team.matchesPlayed8Ball 
          }
        : { 
            points: team.points9Ball, 
            wins: team.wins9Ball, 
            matches: team.matchesPlayed9Ball 
          };
      
      const winPercentage = stats.matches > 0 
        ? Math.round((stats.wins / stats.matches) * 100) 
        : 0;
      
      return (
        <div key={team.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="bg-primary text-white rounded-full p-3">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{team.name}</h3>
              <p className="text-sm text-gray-500 flex items-center">
                <User className="w-4 h-4 mr-1.5"/>Captain: {team.captain}
              </p>
            </div>
          </div>
          <div className="flex justify-between text-center border-t border-b py-2">
            <div>
              <p className="text-xl font-bold">{stats.points}</p>
              <p className="text-xs text-gray-500 uppercase">Points</p>
            </div>
            <div>
              <p className="text-xl font-bold">{winPercentage}%</p>
              <p className="text-xs text-gray-500 uppercase">Win %</p>
            </div>
            <div>
              <p className="text-xl font-bold">{stats.matches}</p>
              <p className="text-xs text-gray-500 uppercase">Played</p>
            </div>
          </div>
          <button 
            onClick={() => handleSelectTeam(team)} 
            className="w-full btn btn-secondary"
          >
            View Roster
          </button>
        </div>
      );
    })}
  </div>
      {showCreateTeamModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Create New Team</h3>
                    <button 
                      onClick={() => setShowCreateTeamModal(false)} 
                      className="text-gray-400 hover:text-gray-600"
                    >
                        <Plus className="w-5 h-5 rotate-45" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                        <input 
                          type="text" 
                          value={newTeamName} 
                          onChange={(e) => setNewTeamName(e.target.value)} 
                          placeholder="Enter team name" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Captain's Name</label>
                        <input 
                          type="text" 
                          value={newCaptainName} 
                          onChange={(e) => setNewCaptainName(e.target.value)} 
                          placeholder="Enter captain's name" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    {formError && (
                      <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                        {formError}
                      </div>
                    )}
                    <div className="flex space-x-3 pt-4">
                        <button 
                          onClick={() => setShowCreateTeamModal(false)} 
                          className="flex-1 btn bg-gray-200 hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button 
                          onClick={handleCreateTeamSubmit} 
                          className="flex-1 btn btn-primary"
                        >
                            Create Team
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Teams;