import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Calendar, Users, Trophy, DollarSign, MapPin, Settings } from 'lucide-react';
import { Tournament } from '../types';

// Import Firestore functions and the db object
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

// The component no longer needs to receive tournaments or addTournament as props
interface TournamentsProps {
  isAdmin: boolean;
}

const Tournaments: React.FC<TournamentsProps> = ({ isAdmin }) => {
  // State for loading and managing tournament data locally
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
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

  // Function to fetch tournament data from Firestore
  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "tournaments"));
      const tournamentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tournament[];
      setTournaments(tournamentsData);
    } catch (error) {
      console.error("Error fetching tournaments: ", error);
    }
    setLoading(false);
  };

  // useEffect hook runs fetchTournaments once when the component first loads
  useEffect(() => {
    fetchTournaments();
  }, []);

  const filteredTournaments = useMemo(() => {
    // This logic now uses the local state fetched from Firestore
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
    setFormat('Single Elimination');
    setMaxPlayers('32');
    setEntry('');
    setFormError('');
  };

  // This function now writes the new tournament directly to Firestore
  const handleCreateTournamentSubmit = async () => {
    if (!name || !date || !prize || !entry) {
      setFormError('Name, Start Date, Prize Pool, and Entry Fee are required.');
      return;
    }
    try {
      const newTournamentData = {
        name,
        description,
        date,
        endDate: endDate || date,
        location,
        prize,
        format,
        maxPlayers: parseInt(maxPlayers),
        entry,
        players: 0, // Initialize player count
        status: 'upcoming' as const,
      };
      await addDoc(collection(db, "tournaments"), newTournamentData);
      closeModal();
      fetchTournaments(); // Refresh the list
    } catch (error) {
      console.error("Error creating tournament: ", error);
      setFormError("Failed to create tournament. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center p-10 font-semibold text-gray-500">Loading Tournaments...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Tournaments</h2>
          {isAdmin && (
            <button onClick={handleCreateTournamentClick} className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Tournament
            </button>
          )}
        </div>
        
        <div className="flex border-b border-gray-200">
          <button onClick={() => setActiveTab('active')} className={`px-4 py-2 font-medium text-sm ${activeTab === 'active' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Active</button>
          <button onClick={() => setActiveTab('upcoming')} className={`px-4 py-2 font-medium text-sm ${activeTab === 'upcoming' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Upcoming</button>
          <button onClick={() => setActiveTab('completed')} className={`px-4 py-2 font-medium text-sm ${activeTab === 'completed' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Completed</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.length > 0 ? filteredTournaments.map(tournament => (
            <div key={tournament.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{tournament.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4 h-10 overflow-hidden">{tournament.description}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-400"/> {tournament.date}</p>
                  <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400"/> {tournament.location}</p>
                  <p className="flex items-center"><DollarSign className="w-4 h-4 mr-2 text-gray-400"/> {tournament.prize} Prize Pool</p>
                  <p className="flex items-center"><Trophy className="w-4 h-4 mr-2 text-gray-400"/> {tournament.format}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold">{tournament.players} / {tournament.maxPlayers} Players</span>
                  <span className="text-gray-500">{getProgressPercentage(tournament.players, tournament.maxPlayers)}% Full</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${getProgressPercentage(tournament.players, tournament.maxPlayers)}%` }}></div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium">No Tournaments Found</h3>
              <p>No tournaments match the selected filter.</p>
            </div>
          )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                </div>
              </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., City Billiards Hall" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prize Pool</label>
                    <input type="text" value={prize} onChange={e => setPrize(e.target.value)} placeholder="e.g., $1000" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                    <select value={format} onChange={e => setFormat(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Single Elimination</option>
                      <option>Double Elimination</option>
                      <option>Round Robin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Players</label>
                    <input type="number" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entry Fee</label>
                  <input type="text" value={entry} onChange={e => setEntry(e.target.value)} placeholder="e.g., $25 or Free" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                </div>

              {formError && <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{formError}</div>}
              
              <div className="flex space-x-3 pt-4 border-t">
                <button onClick={closeModal} className="flex-1 btn bg-gray-200 hover:bg-gray-300">Cancel</button>
                <button onClick={handleCreateTournamentSubmit} className="flex-1 btn btn-primary">Create Tournament</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tournaments;
