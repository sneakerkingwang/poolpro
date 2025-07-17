import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Gamepad2, Target, CheckCircle } from 'lucide-react';
import { Match, Player, Tournament, Team } from '../types';
import { getRaceToPoints } from '../utils/usapl';

interface MatchesProps {
  isAdmin: boolean;
  players: Player[];
  teams: Team[];
  matches: Match[];
  tournaments: Tournament[];
  startNewMatch: (matchSetup: Omit<Match, 'id' | 'status' | 'date' | 'time' | 'score' | 'games' | 'points1' | 'points2'>) => void;
  addTournament: (tournament: Omit<Tournament, 'id' | 'players'>) => void;
  openModalOnLoad: boolean;
  setOpenModalOnLoad: (value: boolean) => void;
}

const Matches: React.FC<MatchesProps> = ({ isAdmin, players, teams, matches, startNewMatch, addTournament, openModalOnLoad, setOpenModalOnLoad }) => {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [gameTypeFilter, setGameTypeFilter] = useState<'all' | '8-ball' | '9-ball'>('all');
  
  const [gameType, setGameType] = useState<'8-ball' | '9-ball'>('8-ball');
  const [team1Id, setTeam1Id] = useState<string>('');
  const [team2Id, setTeam2Id] = useState<string>('');
  const [player1Id, setPlayer1Id] = useState<string>('');
  const [player2Id, setPlayer2Id] = useState<string>('');
  const [pointsToWin, setPointsToWin] = useState<[number, number] | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (openModalOnLoad) {
      setShowSetupModal(true);
      setOpenModalOnLoad(false);
    }
  }, [openModalOnLoad, setOpenModalOnLoad]);

  useEffect(() => {
    if (player1Id && player2Id) {
      const p1 = players.find(p => p.id === parseInt(player1Id));
      const p2 = players.find(p => p.id === parseInt(player2Id));
      if (p1 && p2) {
        setPointsToWin(getRaceToPoints(p1.rating, p2.rating));
      }
    } else {
      setPointsToWin(null);
    }
  }, [player1Id, player2Id, players]);

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
        if (gameTypeFilter === 'all') return true;
        return match.gameType === gameTypeFilter;
    });
  }, [matches, gameTypeFilter]);

  const handleStartMatch = () => {
    if (!player1Id || !player2Id || !pointsToWin) {
      setFormError('Both players must be selected.');
      return;
    }
    startNewMatch({
        player1Id: parseInt(player1Id),
        player2Id: parseInt(player2Id),
        gameType,
        pointsToWin1: pointsToWin[0],
        pointsToWin2: pointsToWin[1],
        tournament: "League Match",
        table: "Main Table"
    });
    setShowSetupModal(false);
  };

  const closeModal = () => {
    setShowSetupModal(false);
    setTeam1Id('');
    setTeam2Id('');
    setPlayer1Id('');
    setPlayer2Id('');
    setFormError('');
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Match History</h2>
        <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-gray-200 p-1 rounded-lg">
                <button onClick={() => setGameTypeFilter('all')} className={`px-3 py-1 rounded-md text-sm font-semibold ${gameTypeFilter === 'all' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}>All</button>
                <button onClick={() => setGameTypeFilter('8-ball')} className={`px-3 py-1 rounded-md text-sm font-semibold ${gameTypeFilter === '8-ball' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}>8-Ball</button>
                <button onClick={() => setGameTypeFilter('9-ball')} className={`px-3 py-1 rounded-md text-sm font-semibold ${gameTypeFilter === '9-ball' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}>9-Ball</button>
            </div>
            {isAdmin && (
                <button onClick={() => setShowSetupModal(true)} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Match
                </button>
            )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {filteredMatches.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium">No Matches Recorded</h3>
                <p>Click "New Match" to get started.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {filteredMatches.map(match => (
                    <div key={match.id} className="p-4 border rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-bold">{match.player1} vs {match.player2}</p>
                            <p className="text-sm text-gray-500">{match.tournament} - {match.date}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg text-primary">{match.score}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 justify-end"><CheckCircle className="w-3 h-3 text-green-500"/>Completed</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {showSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Set Up New Match</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Game Type</label>
                    <div className="flex gap-2">
                        <button onClick={() => setGameType('8-ball')} className={`btn flex-1 ${gameType === '8-ball' ? 'btn-primary' : 'bg-gray-200'}`}>8-Ball</button>
                        <button onClick={() => setGameType('9-ball')} className={`btn flex-1 ${gameType === '9-ball' ? 'btn-primary' : 'bg-gray-200'}`}>9-Ball</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 p-4 border rounded-lg">
                        <label className="block text-sm font-medium text-gray-700">Team 1</label>
                        <select value={team1Id} onChange={e => {setTeam1Id(e.target.value); setPlayer1Id('');}} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">Select Team</option>
                            {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                        <label className="block text-sm font-medium text-gray-700">Player 1</label>
                        <select value={player1Id} onChange={e => setPlayer1Id(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={!team1Id}>
                            <option value="">Select Player</option>
                            {players.filter(p => p.teamId === parseInt(team1Id)).map(player => <option key={player.id} value={player.id}>{player.name} ({player.rating})</option>)}
                        </select>
                    </div>
                    <div className="space-y-2 p-4 border rounded-lg">
                        <label className="block text-sm font-medium text-gray-700">Team 2</label>
                        <select value={team2Id} onChange={e => {setTeam2Id(e.target.value); setPlayer2Id('');}} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">Select Team</option>
                            {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                        <label className="block text-sm font-medium text-gray-700">Player 2</label>
                        <select value={player2Id} onChange={e => setPlayer2Id(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={!team2Id}>
                            <option value="">Select Player</option>
                            {players.filter(p => p.teamId === parseInt(team2Id)).map(player => <option key={player.id} value={player.id}>{player.name} ({player.rating})</option>)}
                        </select>
                    </div>
                </div>

                {pointsToWin && (
                    <div className="text-center bg-blue-50 text-blue-800 p-4 rounded-lg">
                        <p className="font-bold text-xl">Points Needed to Win</p>
                        <div className="flex justify-around items-center mt-2">
                            <div className="w-1/2 text-center">
                                <p className="text-lg truncate font-medium">{players.find(p => p.id === parseInt(player1Id))?.name || 'Player 1'}</p>
                                <p className="text-3xl font-bold">{pointsToWin[0]}</p>
                            </div>
                            <p className="text-2xl font-light text-gray-400">vs</p>
                            <div className="w-1/2 text-center">
                                <p className="text-lg truncate font-medium">{players.find(p => p.id === parseInt(player2Id))?.name || 'Player 2'}</p>
                                <p className="text-3xl font-bold">{pointsToWin[1]}</p>
                            </div>
                        </div>
                    </div>
                )}

                {formError && <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{formError}</div>}
                <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={closeModal} className="btn bg-gray-200 hover:bg-gray-300">Cancel</button>
                    <button onClick={handleStartMatch} className="btn btn-primary flex items-center gap-2" disabled={!pointsToWin}>
                        <Gamepad2 className="w-5 h-5"/> Start Match
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Matches;