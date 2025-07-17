// UPDATED FILE: src/components/Teams.tsx

import React, { useState } from 'react';
import { Shield, User, Plus } from 'lucide-react';
import { Team, Player } from '../types';

interface TeamsProps {
  teams: Team[];
  players: Player[];
  isAdmin: boolean;
  addTeam: (teamName: string, captainName: string) => void;
}

const Teams: React.FC<TeamsProps> = ({ teams, players, isAdmin, addTeam }) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [gameType, setGameType] = useState<'8-ball' | '9-ball'>('8-ball');
  const [newTeamName, setNewTeamName] = useState('');
  const [newCaptainName, setNewCaptainName] = useState('');
  const [formError, setFormError] = useState('');

  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleCloseRoster = () => {
    setSelectedTeam(null);
  };

  const handleCreateTeamSubmit = () => {
    if (!newTeamName.trim() || !newCaptainName.trim()) {
      setFormError('Team Name and Captain Name are required.');
      return;
    }
    addTeam(newTeamName, newCaptainName);
    setShowCreateTeamModal(false);
    setNewTeamName('');
    setNewCaptainName('');
  };

  const getTeamRoster = (teamId: number) => {
    return players.filter(p => p.teamId === teamId).sort((a,b) => b.rating - a.rating);
  };

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
              {roster.map(player => (
                <tr key={player.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{player.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.rating}</td>
                  <td className="px-6 py-4 whitespace-nowrap">#{player.rank}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.wins8Ball} - {player.matches8Ball - player.wins8Ball}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.wins9Ball} - {player.matches9Ball - player.wins9Ball}</td>
                </tr>
              ))}
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
                <button onClick={() => setGameType('8-ball')} className={`px-3 py-1 rounded-md text-sm font-semibold ${gameType === '8-ball' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}>8-Ball</button>
                <button onClick={() => setGameType('9-ball')} className={`px-3 py-1 rounded-md text-sm font-semibold ${gameType === '9-ball' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}>9-Ball</button>
            </div>
            {isAdmin && (
                <button onClick={() => setShowCreateTeamModal(true)} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create New Team
                </button>
            )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => {
            const stats = gameType === '8-ball' 
                ? { points: team.points8Ball, wins: team.wins8Ball, matches: team.matchesPlayed8Ball }
                : { points: team.points9Ball, wins: team.wins9Ball, matches: team.matchesPlayed9Ball };
            const winPercentage = stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;
            return (
                <div key={team.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-primary text-white rounded-full p-3"><Shield className="w-6 h-6" /></div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{team.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center"><User className="w-4 h-4 mr-1.5"/>Captain: {team.captain}</p>
                        </div>
                    </div>
                    <div className="flex justify-between text-center border-t border-b py-2">
                        <div><p className="text-xl font-bold">{stats.points}</p><p className="text-xs text-gray-500 uppercase">Points</p></div>
                        <div><p className="text-xl font-bold">{winPercentage}%</p><p className="text-xs text-gray-500 uppercase">Win %</p></div>
                        <div><p className="text-xl font-bold">{stats.matches}</p><p className="text-xs text-gray-500 uppercase">Played</p></div>
                    </div>
                    <button onClick={() => handleSelectTeam(team)} className="w-full btn btn-secondary">
                        View Roster
                    </button>
                </div>
            )
        })}
      </div>
      {/* ... Modals ... */}
    </>
  );
};

export default Teams;