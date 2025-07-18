import React, { useState, useEffect, useMemo } from 'react';
import { Player, Match, Team } from '../types';
import { ArrowLeft, Star, Target, Percent, BarChart, User, Hash, Trophy } from 'lucide-react';

// Import Firestore functions and the db object
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where, or } from 'firebase/firestore';

// The component now receives a playerId string instead of a full player object
interface PlayerDetailProps {
  playerId: string;
  onBack: () => void;
}

const PlayerDetail: React.FC<PlayerDetailProps> = ({ playerId, onBack }) => {
  // State to hold all the data this component needs
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [playerMatches, setPlayerMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect to fetch all data when the component loads or playerId changes
  useEffect(() => {
    const fetchData = async () => {
      if (!playerId) return;
      setLoading(true);
      
      try {
        // 1. Fetch the specific player's document
        const playerDocRef = doc(db, "players", playerId);
        const playerSnap = await getDoc(playerDocRef);

        if (!playerSnap.exists()) {
          console.error("Player not found!");
          setLoading(false);
          return;
        }
        
        const playerData = { id: playerSnap.id, ...playerSnap.data() } as Player;
        setPlayer(playerData);

        // 2. Fetch the player's team data (if they have one)
        if (playerData.teamId) {
          const teamDocRef = doc(db, "teams", playerData.teamId);
          const teamSnap = await getDoc(teamDocRef);
          if (teamSnap.exists()) {
            setTeam({ id: teamSnap.id, ...teamSnap.data() } as Team);
          }
        }

        // 3. Fetch all matches involving this player using a Firestore query
        const matchesRef = collection(db, "matches");
        const q = query(matchesRef, 
          or(
            where('player1Id', '==', playerId),
            where('player2Id', '==', playerId)
          )
        );
        const matchesSnap = await getDocs(q);
        const matchesData = matchesSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Match))
          .filter(m => m.status === 'completed')
          .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        
        setPlayerMatches(matchesData);

      } catch (error) {
        console.error("Error fetching player details:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [playerId]);

  // Calculate player stats dynamically based on their match history
  const calculatedStats = useMemo(() => {
    if (!player || playerMatches.length === 0) {
      return {
        wins: 0,
        losses: 0,
        winRate: 0,
      };
    }
    const wins = playerMatches.filter(m => {
      const isWin = (m.player1Id === player.id && m.score1 > m.score2) || (m.player2Id === player.id && m.score2 > m.score1);
      return isWin;
    }).length;

    const totalMatches = playerMatches.length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    return { wins, losses, winRate };
  }, [player, playerMatches]);

  const getStatCardClass = (label: string) => {
    // ... (this function remains the same)
  };

  if (loading) {
    return <div className="text-center p-10 font-semibold text-gray-500">Loading Player Details...</div>;
  }

  if (!player) {
    return <div className="text-center p-10 font-semibold text-red-500">Player not found.</div>;
  }

  // The stats array now uses the dynamically calculated values
  const stats = [
    { label: 'Rating', value: player.rating, icon: Star },
    { label: 'Win Rate', value: `${calculatedStats.winRate}%`, icon: Percent },
    { label: 'Record', value: `${calculatedStats.wins} - ${calculatedStats.losses}`, icon: Target },
    { label: 'Rank', value: `#${player.rank}`, icon: Hash },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {player.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{player.name}</h2>
            <p className="text-gray-600 flex items-center gap-2">
              {/* Display the fetched team name */}
              <User className="w-4 h-4" />{team ? team.name : 'No Team'}
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Players</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`p-6 rounded-xl text-white shadow-lg bg-gradient-to-br ${getStatCardClass(stat.label)}`}>
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">{stat.label}</p>
                <Icon className="w-8 h-8 opacity-70" />
              </div>
              <p className="text-4xl font-bold mt-2">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Match History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart className="w-5 h-5" /> Match History
          </h3>
        </div>
        <div className="overflow-x-auto">
          {playerMatches.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opponent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tournament</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {playerMatches.map(match => {
                  const opponentName = match.player1Id === player.id ? match.player2Name : match.player1Name;
                  const playerScore = match.player1Id === player.id ? match.score1 : match.score2;
                  const opponentScore = match.player1Id === player.id ? match.score2 : match.score1;
                  const isWin = playerScore > opponentScore;

                  return (
                    <tr key={match.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{opponentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          isWin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isWin ? 'Win' : 'Loss'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{`${playerScore} - ${opponentScore}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center gap-1">
                        <Trophy className="w-4 h-4"/>{match.tournament}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{match.createdAt?.toDate().toLocaleDateString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>No completed matches found for this player.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerDetail;
