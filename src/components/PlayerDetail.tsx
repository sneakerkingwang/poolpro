import React from 'react';
import { Player, Match } from '../types';
import { ArrowLeft, Star, Target, Percent, BarChart, User, Hash, Trophy } from 'lucide-react';

interface PlayerDetailProps {
  player: Player;
  matches: Match[];
  onBack: () => void;
}

const PlayerDetail: React.FC<PlayerDetailProps> = ({ player, matches, onBack }) => {
  const playerMatches = matches
    .filter(m => (m.player1Id === player.id || m.player2Id === player.id) && m.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatCardClass = (label: string) => {
    switch (label) {
      case 'Rating': return 'from-yellow-400 to-amber-500';
      case 'Win Rate': return 'from-green-400 to-emerald-500';
      case 'Rank': return 'from-blue-400 to-sky-500';
      default: return 'from-slate-400 to-gray-500';
    }
  };

  const stats = [
    { label: 'Rating', value: player.rating, icon: Star },
    { label: 'Win Rate', value: `${player.winRate}%`, icon: Percent },
    { label: 'Record', value: `${player.wins} - ${player.matches - player.wins}`, icon: Target },
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
              <User className="w-4 h-4" />{player.team || 'No Team'}
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
                  const opponent = match.player1Id === player.id ? match.player2 : match.player1;
                  const playerScore = match.player1Id === player.id ? match.score1 : match.score2;
                  const opponentScore = match.player1Id === player.id ? match.score2 : match.score1;
                  const isWin = playerScore > opponentScore;

                  return (
                    <tr key={match.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{opponent}</td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{match.date}</td>
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