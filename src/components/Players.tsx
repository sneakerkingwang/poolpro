// UPDATED FILE: src/components/Players.tsx

import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Star, Filter, MoreVertical, Users } from 'lucide-react';
import { Player, Team } from '../types';

interface PlayersProps {
  isAdmin: boolean;
  players: Player[];
  teams: Team[];
  addPlayer: (playerData: { name: string, teamId: number, rating: number }) => void;
  updatePlayer: (player: Player) => void;
  onSelectPlayer: (playerId: number) => void;
}

const Players: React.FC<PlayersProps> = ({ isAdmin, players, teams, addPlayer, updatePlayer, onSelectPlayer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRating, setNewPlayerRating] = useState('500');
  const [newPlayerTeamId, setNewPlayerTeamId] = useState<string>('');
  const [formError, setFormError] = useState('');

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const teamName = teams.find(t => t.id === player.teamId)?.name || '';
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) || teamName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => a.rank - b.rank);
  }, [players, teams, searchTerm]);

  const handleAddPlayer = () => {
    setFormError('');
    setNewPlayerName('');
    setNewPlayerRating('500');
    setNewPlayerTeamId('');
    setShowAddPlayerModal(true);
  };

  const handleEditPlayer = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    setEditingPlayer(player);
    setShowEditPlayerModal(true);
  };

  const handleAddPlayerSubmit = () => {
    if (!newPlayerName.trim() || !newPlayerTeamId) {
      setFormError('Player Name and Team are required.');
      return;
    }
    addPlayer({
      name: newPlayerName.trim(),
      teamId: parseInt(newPlayerTeamId),
      rating: parseInt(newPlayerRating) || 500,
    });
    setShowAddPlayerModal(false);
  };

  const handleUpdatePlayerSubmit = () => {
    if (editingPlayer) {
      updatePlayer(editingPlayer);
      setShowEditPlayerModal(false);
      setEditingPlayer(null);
    }
  };

  const getTeamName = (teamId: number) => {
    return teams.find(t => t.id === teamId)?.name || 'N/A';
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Players</h2>
            {isAdmin && (
                <button onClick={handleAddPlayer} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add New Player
                </button>
            )}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                    type="text"
                    placeholder="Search players or teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>
        </div>

        {/* Players Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredPlayers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlayers.map((player) => (
                    <tr
                      key={player.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => onSelectPlayer(player.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{player.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getTeamName(player.teamId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-primary">{player.rating}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          player.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {player.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={(e) => handleEditPlayer(e, player)} className="p-2 text-gray-400 hover:text-primary rounded-full transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Players Found</h3>
              <p className="text-gray-500 mb-4">Add a team first, then add players to get started.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Player Modal */}
      {showAddPlayerModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Player</h3>
              <button onClick={() => setShowAddPlayerModal(false)} className="text-gray-400 hover:text-gray-600"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder="Enter player name" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                <select value={newPlayerTeamId} onChange={(e) => setNewPlayerTeamId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Select a Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Rating</label>
                <input type="number" value={newPlayerRating} onChange={(e) => setNewPlayerRating(e.target.value)} placeholder="500" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
              </div>
              {formError && <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{formError}</div>}
              <div className="flex space-x-3 pt-4">
                <button onClick={() => setShowAddPlayerModal(false)} className="flex-1 btn bg-gray-200 hover:bg-gray-300">Cancel</button>
                <button onClick={handleAddPlayerSubmit} className="flex-1 btn btn-primary">Add Player</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {showEditPlayerModal && editingPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Player</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" value={editingPlayer.name} onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                <select value={editingPlayer.teamId} onChange={(e) => setEditingPlayer({...editingPlayer, teamId: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <input type="number" value={editingPlayer.rating} onChange={(e) => setEditingPlayer({...editingPlayer, rating: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
              </div>
              <div className="flex space-x-3 pt-4">
                <button onClick={() => setShowEditPlayerModal(false)} className="flex-1 btn bg-gray-200">Cancel</button>
                <button onClick={handleUpdatePlayerSubmit} className="flex-1 btn btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Players;