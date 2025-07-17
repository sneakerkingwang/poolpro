export interface Player {
  id: number;
  name: string;
  teamId: number;
  status: 'active' | 'inactive';
  rating: number;
  previousRating: number;
  rank: number;
  
  // Unified stats are split
  matches8Ball: number;
  wins8Ball: number;
  matches9Ball: number;
  wins9Ball: number;
}

export interface GameLog {
    gameNumber: number;
    winnerId: number;
    points: number; 
}

export interface Match {
  id: number;
  player1: string;
  player2: string;
  player1Id: number;
  player2Id: number;
  gameType: '8-ball' | '9-ball';
  pointsToWin1: number;
  pointsToWin2: number;
  points1: number;
  points2: number;
  games: GameLog[];
  tournament: string;
  tournamentId?: number;
  date: string;
  time: string;
  table: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  duration?: string;
  score?: string;
}

export interface Tournament {
  id: number;
  name: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  prize: string;
  format: string;
  players: number;
  maxPlayers: number;
  entry: string;
  status: 'active' | 'upcoming' | 'completed';
}

export interface Team {
  id: number;
  name: string;
  captain: string;

  // Separate stats for each game type
  points8Ball: number;
  matchesPlayed8Ball: number;
  wins8Ball: number;
  
  points9Ball: number;
  matchesPlayed9Ball: number;
  wins9Ball: number;
}