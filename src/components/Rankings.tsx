import React, { useState, useMemo } from 'react';
import { Trophy, TrendingUp, TrendingDown, Star, Target, Award, Users, Filter } from 'lucide-react';
import { Player } from '../types';

interface RankingsProps {
  isAdmin: boolean;
  players: Player[];
}

const Rankings: React.FC<RankingsProps> = ({ isAdmin, players }) => {
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [timeframe, setTimeframe] = useState('current');

  const rankings = useMemo(() => {
    return [...players].sort((a, b) => b.rating - a.rating);
  }, [players, selectedCategory, timeframe]);

  const { averageRating, mostActivePlayer, bestWinRatePlayer } = useMemo(() => {
    if (players.length === 0) {
      return {
        averageRating: 0,
        mostActivePlayer: null,
        bestWinRatePlayer: null,
      };
    }
    const avgRating = Math.round(players.reduce((sum, p) => sum + p.rating, 0) / players.length);
    const mostActive = players.reduce((prev, current) => (prev.matches > current.matches ? prev : current));
    const bestWinRate = players.reduce((prev, current) => (prev.winRate > current.winRate ? prev : current));

    return {
      averageRating: avgRating,
      mostActivePlayer: mostActive,
      bestWinRatePlayer: bestWinRate,
    };
  }, [players]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-gray-200 text-gray-800';
  };
  
  const getRatingColor = (rating: number) => {
    if (rating >= 700) return 'text-red-600 bg-red-50';
    if (rating >= 600) return 'text-orange-600 bg-orange-50';
    if (rating >= 500) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Player Rankings</h2>
        {/* Filter options */}
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
        {/* Table display logic */}
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
          <div className="text-sm text-gray-600 mt-1">{mostActivePlayer?.matches || 0} matches played</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Best Win Rate</h3>
            <Award className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{bestWinRatePlayer?.winRate || 0}%</div>
          <div className="text-sm text-gray-600 mt-1 truncate">{bestWinRatePlayer?.name || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default Rankings;