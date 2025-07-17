import React, { useState, useMemo } from 'react';
import { Plus, Calendar, Users, Trophy, DollarSign, Clock, MapPin, Settings } from 'lucide-react';
import { Tournament } from '../types';

interface TournamentsProps {
  isAdmin: boolean;
  tournaments: Tournament[];
  addTournament: (tournament: Omit<Tournament, 'id' | 'players'>) => void;
}

const Tournaments: React.FC<TournamentsProps> = ({ isAdmin, tournaments, addTournament }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateTournamentModal, setShowCreateTournamentModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [prize, setPrize] = useState('');
  const [format, setFormat] = useState('Single Elimination');
  const [maxPlayers, setMaxPlayers] = useState('32');
  const [entry, setEntry] = useState('');
  const [formError, setFormError] = useState('');

  const filteredTournaments = useMemo(() => {
    return tournaments.filter(tournament => {
      if (activeTab === 'active') return tournament.status === 'active';
      if (activeTab === 'upcoming') return tournament.status === 'upcoming';
      if (activeTab === 'completed') return tournament.status === 'completed';
      return true;
    });
  }, [tournaments, activeTab]);

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (current: number, max: number) => {
    if (max === 0) return 0;
    return Math.round((current / max) * 100);
  };

  const handleCreateTournamentClick = () => {
    setFormError('');
    setShowCreateTournamentModal(true);
  };

  const closeModal = () => {
    setShowCreateTournamentModal(false);
    // Reset form
    setName('');
    setDescription('');
    setDate('');
    setEndDate('');
    setLocation('');
    setPrize('');
    setEntry('');
    setFormError('');
  };

  const handleCreateTournamentSubmit = () => {
    if (!name || !date || !prize || !entry) {
      setFormError('Name, Start Date, Prize Pool, and Entry Fee are required.');
      return;
    }
    addTournament({
      name,
      description,
      date,
      endDate: endDate || date,
      location,
      prize,
      format,
      maxPlayers: parseInt(maxPlayers),
      entry,
      status: 'upcoming',
    });
    closeModal();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header and stats sections */}
        
        {/* Tournament Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Display logic for tournaments */}
        </div>
      </div>

      {/* Create Tournament Modal */}
      {showCreateTournamentModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Tournament</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Annual City Championship" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief description of the tournament..." className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[80px]"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                </div>
              </div>
              
              {/* Other inputs like Location, Prize, Format, etc. */}

              {formError && <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{formError}</div>}
              
              <div className="flex space-x-3 pt-4">
                <button onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg">Cancel</button>
                <button onClick={handleCreateTournamentSubmit} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Create Tournament</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tournaments;