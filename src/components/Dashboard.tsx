import React, { useMemo } from 'react';
import { Trophy, Users, Target, TrendingUp, Calendar, Clock, Award, Star, Shield } from 'lucide-react';
import { Player, Match, Tournament, Team } from '../types';

interface DashboardProps {
  onNewMatch: () => void;
  onNavigate: (tab: string) => void;
  isAdmin: boolean;
  players: Player[];
  matches: Match[];
  tournaments: Tournament[];
  teams: Team[]; // Add teams
}

const Dashboard: React.FC<DashboardProps> = ({ onNewMatch, onNavigate, isAdmin, players, matches, tournaments, teams }) => {

  const stats = useMemo(() => {
    const totalPlayers = players.length;
    const totalTeams = teams.length; // New stat
    const activeTournaments = tournaments.filter(t => t.status === 'active').length;
    const matchesToday = matches.filter(m => m.date === new Date().toISOString().split('T')[0]).length;
    
    return [
      { label: 'Total Teams', value: totalTeams.toString(), icon: Shield, color: 'bg-indigo-500' },
      { label: 'Total Players', value: totalPlayers.toString(), icon: Users, color: 'bg-blue-500' },
      { label: 'Active Tournaments', value: activeTournaments.toString(), icon: Trophy, color: 'bg-yellow-500' },
      { label: 'Matches Today', value: matchesToday.toString(), icon: Target, color: 'bg-green-500' },
    ];
  }, [players, matches, tournaments, teams]);

  const recentMatches = useMemo(() => {
    return matches
      .filter(m => m.status === 'completed')
      .slice(0, 5);
  }, [matches]);

  const upcomingTournaments = useMemo(() => {
    return tournaments
      .filter(t => t.status === 'upcoming')
      .slice(0, 5);
  }, [tournaments]);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transform hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-full p-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Recent Activity & Upcoming Tournaments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Matches */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Matches</h3>
            <button
              onClick={() => onNavigate('matches')}
              className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="p-6 space-y-4">
            {recentMatches.length > 0 ? recentMatches.map((match) => (
              <div key={match.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{match.player1} vs {match.player2}</p>
                  <p className="text-sm text-gray-500">{match.tournament} • {match.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">{match.score}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent matches</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tournaments */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Tournaments</h3>
            <button
              onClick={() => onNavigate('tournaments')}
              className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="p-6 space-y-4">
            {upcomingTournaments.length > 0 ? upcomingTournaments.map((tournament) => (
              <div key={tournament.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{tournament.name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" />{tournament.date}</span>
                    <span className="flex items-center"><Users className="w-4 h-4 mr-1.5" />{tournament.players} players</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-yellow-600">{tournament.prize}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No upcoming tournaments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={onNewMatch}
              className="flex items-center justify-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-green-800 font-medium"
            >
              <Target className="w-5 h-5" />
              <span>Record Match</span>
            </button>
            <button
              onClick={() => onNavigate('players')}
              className="flex items-center justify-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-blue-800 font-medium"
            >
              <Users className="w-5 h-5" />
              <span>Add Player</span>
            </button>
            <button
              onClick={() => onNavigate('tournaments')}
              className="flex items-center justify-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-800 font-medium"
            >
              <Trophy className="w-5 h-5" />
              <span>Create Tournament</span>
            </button>
            <button
              onClick={() => onNavigate('statistics')}
              className="flex items-center justify-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-purple-800 font-medium"
            >
              <TrendingUp className="w-5 h-5" />
              <span>View Statistics</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;