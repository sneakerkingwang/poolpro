import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { Player, Team } from '../types';

// Import all necessary Firestore functions and the db object
import { db } from '../firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// This component no longer needs players, teams, addPlayer, or updatePlayer as props.
interface PlayersProps {
  isAdmin: boolean;
  onSelectPlayer: (playerId: string) => void; // The ID from Firestore will be a string
}

const Players: React.FC<PlayersProps> = ({ isAdmin, onSelectPlayer }) => {
  // State for loading, players, and teams, all managed within this component
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRating, setNewPlayerRating] = useState('500');
  const [newPlayerTeamId, setNewPlayerTeamId] = useState<string>('');
  const [formError, setFormError] = useState('');

  // A single function to fetch all necessary data from Firestore
  const fetchData = async () => {
    // Set loading to true at the start of a fetch operation
    setLoading(true);
    try {
      // Fetch Players and Teams concurrently for better performance
      const [playersSnap, teamsSnap] = await Promise.all([
        getDocs(collection(db, "players")),
        getDocs(collection(db, "teams"))
      ]);

      const playersData = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Player[];
      const teamsData = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Team[];
      
      setPlayers(playersData);
      setTeams(teamsData);

    } catch (error) {
      console.error("Error fetching data: ", error);
    }
    setLoading(false);
  };

  // useEffect hook runs fetchData once when the component first loads
  useEffect(() => {
    fetchData();
  }, []);

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
    // Pre-select the first team in the dropdown if available
    setNewPlayerTeamId(teams.length > 0 ? teams[0].id : '');
    setShowAddPlayerModal(true);
  };

  const handleEditPlayer = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    setEditingPlayer(player);
    setShowEditPlayerModal(true);
  };

  const handleAddPlayerSubmit = async () => {
    if (!newPlayerName.trim() || !newPlayerTeamId) {
      setFormError('Player Name and Team are required.');
      return;
    }
    try {
      const newPlayerData = {
        name: newPlayerName.trim(),
        teamId: newPlayerTeamId,
        rating: parseInt(newPlayerRating) || 500,
        rank: 0,
        status: 'active',
        wins8Ball: 0, matches8Ball: 0,
        wins9Ball: 0, matches9Ball: 0,
      };
      await addDoc(collection(db, "players"), newPlayerData);
      setShowAddPlayerModal(false);
      fetchData();
    } catch (error) {
      console.error("Error adding player: ", error);
      setFormError("Failed to add player.");
    }
  };

  const handleUpdatePlayerSubmit = async () => {
    if (editingPlayer && editingPlayer.id) {
      try {
        const playerDocRef = doc(db, "players", editingPlayer.id);
        const { id, ...playerData } = editingPlayer;
        await updateDoc(playerDocRef, playerData);
        
        setShowEditPlayerModal(false);
        setEditingPlayer(null);
        fetchData();
      } catch (error) {
        console.error("Error updating player: ", error);
      }
    }
  };

  const handleDeletePlayer = async (e: React.MouseEvent, playerId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this player? This action cannot be undone.")) {
      try {
        const playerDocRef = doc(db, "players", playerId);
        await deleteDoc(playerDocRef);
        fetchData();
      } catch (error) {
        console.error("Error deleting player: ", error);
      }
    }
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'N/A';
  }

  if (loading) {
    return <div className="text-center p-10 font-semibold text-gray-500">Loading...</div>;
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
                      className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
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
                          <div className="flex justify-end items-center gap-2">
                            <button onClick={(e) => handleEditPlayer(e, player)} className="p-2 text-gray-400 hover:text-primary rounded-full transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => handleDeletePlayer(e, player.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
              <p className="text-gray-500 mb-4">Click "Add New Player" to get started.</p>
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
                <select value={editingPlayer.teamId} onChange={(e) => setEditingPlayer({...editingPlayer, teamId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
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