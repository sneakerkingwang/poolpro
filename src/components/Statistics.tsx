import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, Star, TrendingDown } from 'lucide-react';
import { Player } from '../types';

interface StatisticsProps {
  isAdmin: boolean;
  players: Player[];
}

const Statistics: React.FC<StatisticsProps> = ({ players }) => {
  const [gameType, setGameType] = useState<'8-ball' | '9-ball'>('8-ball');

  const playerStats = useMemo(() => {
    return [...players].sort((a, b) => a.rank - b.rank);
  }, [players]);

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return 'text-green-600';
    if (improvement < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Player Statistics</h2>
        <div className="flex gap-1 bg-gray-200 p-1 rounded-lg">
            <button onClick={() => setGameType('8-ball')} className={`px-4 py-1 rounded-md text-sm font-semibold ${gameType === '8-ball' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}>8-Ball</button>
            <button onClick={() => setGameType('9-ball')} className={`px-4 py-1 rounded-md text-sm font-semibold ${gameType === '9-ball' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}>9-Ball</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 p-6">{gameType === '8-ball' ? '8-Ball' : '9-Ball'} Player Leaderboard</h3>
        {playerStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matches</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Win Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating Change</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {playerStats.map((player) => {
                    const stats = gameType === '8-ball' 
                        ? { matches: player.matches8Ball, wins: player.wins8Ball }
                        : { matches: player.matches9Ball, wins: player.wins9Ball };
                    
                    const winRate = stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;
                    const ratingChange = player.rating - player.previousRating;

                    return (
                        <tr key={player.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">#{player.rank}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{player.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{stats.matches}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-semibold">{winRate}%</td>
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-lg text-secondary">{player.rating}</td>
                            <td className={`px-6 py-4 whitespace-nowrap font-semibold ${getImprovementColor(ratingChange)}`}>
                                <div className="flex items-center">
                                    {ratingChange > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : ratingChange < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : <span className="w-5" />}
                                    {ratingChange > 0 ? '+' : ''}{ratingChange}
                                </div>
                            </td>
                        </tr>
                    )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No player data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;