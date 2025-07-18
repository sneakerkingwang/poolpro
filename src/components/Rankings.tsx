import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Star, Target, Award, Users } from 'lucide-react';
import { Player } from '../types';

// Import Firestore functions and the db object
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// The component no longer needs to receive players as a prop
interface RankingsProps {
  isAdmin: boolean;
}

const Rankings: React.FC<RankingsProps> = ({ isAdmin }) => {
  // State for loading and managing player data locally
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);

  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [timeframe, setTimeframe] = useState('current');

  // Function to fetch player data from Firestore
  const fetchPlayers = async () => {
    setLoading(true);
    try {
      // Create a query to get players and order them by rating
      const playersRef = collection(db, "players");
      const q = query(playersRef, orderBy("rating", "desc"));
      
      const querySnapshot = await getDocs(q);
      const playersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Player[];
      setPlayers(playersData);
    } catch (error) {
      console.error("Error fetching players for rankings: ", error);
    }
    setLoading(false);
  };

  // useEffect hook runs fetchPlayers once when the component first loads
  useEffect(() => {
    fetchPlayers();
  }, []);

  // The 'rankings' are now simply the fetched and sorted players list
  const rankings = useMemo(() => players, [players]);

  const { averageRating, mostActivePlayer, bestWinRatePlayer } = useMemo(() => {
    if (players.length === 0) {
      return { averageRating: 0, mostActivePlayer: null, bestWinRatePlayer: null };
    }

    // Calculate total matches for each player
    const playersWithTotalMatches = players.map(p => ({
      ...p,
      totalMatches: (p.matches8Ball || 0) + (p.matches9Ball || 0),
    }));

    const avgRating = Math.round(players.reduce((sum, p) => sum + p.rating, 0) / players.length);
    
    // Find the player with the most total matches
    const mostActive = playersWithTotalMatches.reduce((prev, current) => 
      (prev.totalMatches > current.totalMatches ? prev : current)
    );

    // Calculate win rate for each player and find the best
    const bestWinRate = players.map(p => {
      const totalWins = (p.wins8Ball || 0) + (p.wins9Ball || 0);
      const totalMatches = (p.matches8Ball || 0) + (p.matches9Ball || 0);
      const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
      return {...p, winRate};
    }).reduce((prev, current) => (prev.winRate > current.winRate ? prev : current));

    return {
      averageRating: avgRating,
      mostActivePlayer: mostActive,
      bestWinRatePlayer: bestWinRate,
    };
  }, [players]);

  const getRankBadge = (rank: number) => {
    // ... (this function remains the same)
  };
  
  const getRatingColor = (rating: number) => {
    // ... (this function remains the same)
  };

  if (loading) {
    return <div className="text-center p-10 font-semibold text-gray-500">Loading Rankings...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Player Rankings</h2>
      </div>

      {/* Top Players Podium */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Top 3 Players</h3>
        {rankings.length > 0 ? (
          <div className="flex justify-center items-end space-x-4 md:space-x-8">
            {/* 2nd Place */}
            {rankings[1] && (
              <div className="text-center w-1/3">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">2</div>
                <div className="w-full h-24 bg-gray-300 rounded-t-lg flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-gray-600" />
                </div>
                <div className="mt-2">
                  <p className="font-semibold text-gray-900 truncate">{rankings[1].name}</p>
                  <p className="text-sm text-gray-600">{rankings[1].rating} pts</p>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {rankings[0] && (
               <div className="text-center w-1/3 order-first md:order-none">
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3">1</div>
                <div className="w-full h-32 bg-yellow-400 rounded-t-lg flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-yellow-700" />
                </div>
                <div className="mt-2">
                  <p className="font-semibold text-gray-900 truncate">{rankings[0].name}</p>
                  <p className="text-sm text-gray-600">{rankings[0].rating} pts</p>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {rankings[2] && (
              <div className="text-center w-1/3">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">3</div>
                <div className="w-full h-20 bg-amber-600 rounded-t-lg flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-amber-800" />
                </div>
                <div className="mt-2">
                  <p className="font-semibold text-gray-900 truncate">{rankings[2].name}</p>
                  <p className="text-sm text-gray-600">{rankings[2].rating} pts</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No rankings available yet</p>
          </div>
        )}
      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rankings.map((player, index) => {
                const rank = index + 1;
                const ratingChange = player.rating - player.previousRating;
                return (
                  <tr key={player.id}>
                    <td className="px-6 py-4">
                      <span className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${getRankBadge(rank)}`}>{rank}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{player.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 font-semibold rounded-md ${getRatingColor(player.rating)}`}>{player.rating}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center text-sm font-medium ${ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {ratingChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1"/> : <TrendingDown className="w-4 h-4 mr-1"/>}
                        {Math.abs(ratingChange)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ranking Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Average Rating</h3>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{averageRating}</div>
          <div className="text-sm text-gray-600 mt-1">Across all ranked players</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Most Active</h3>
            <Target className="w-8 h-8 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 truncate">{mostActivePlayer?.name || 'N/A'}</div>
          <div className="text-sm text-gray-600 mt-1">{mostActivePlayer?.totalMatches || 0} matches played</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Best Win Rate</h3>
            <Award className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{Math.round(bestWinRatePlayer?.winRate || 0)}%</div>
          <div className="text-sm text-gray-600 mt-1 truncate">{bestWinRatePlayer?.name || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default Rankings;
