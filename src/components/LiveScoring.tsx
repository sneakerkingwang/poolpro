// UPDATED FILE: src/components/LiveScoring.tsx

import React, { useState, useMemo } from 'react';
import { Match, GameLog } from '../types';
import { X, Trophy } from 'lucide-react';

interface LiveScoringProps {
  match: Match;
  onFinalize: (match: Match) => void;
  onCancel: () => void;
}

const Ball = ({ number, color, isSelected, onClick, onDoubleClick, isDead }: { number: number, color: string, isSelected?: boolean, onClick?: () => void, onDoubleClick?: () => void, isDead?: boolean }) => (
    <div 
        onClick={onClick} 
        onDoubleClick={onDoubleClick}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all duration-200 
        ${color} 
        ${isDead ? 'opacity-50' : 'cursor-pointer'}
        ${isSelected ? 'ring-4 ring-blue-500 scale-110' : 'ring-2 ring-transparent'}`}
    >
        {number}
        {isDead && <X className="w-8 h-8 text-white absolute" />}
    </div>
);

const LiveScoring: React.FC<LiveScoringProps> = ({ match: initialMatch, onFinalize, onCancel }) => {
  const [match, setMatch] = useState<Match>(initialMatch);
  const [show8BallModal, setShow8BallModal] = useState(false);
  const [gameWinnerId, setGameWinnerId] = useState<number | null>(null);
  const [loserScore, setLoserScore] = useState(0);
  
  const [selectedBall, setSelectedBall] = useState<number | null>(null);
  const [pocketedByPlayer1, setPocketedByPlayer1] = useState<number[]>([]);
  const [pocketedByPlayer2, setPocketedByPlayer2] = useState<number[]>([]);
  const [deadBalls, setDeadBalls] = useState<number[]>([]);

  const onTheHill = useMemo(() => {
    const pointsToGo1 = match.pointsToWin1 - match.points1;
    const pointsToGo2 = match.pointsToWin2 - match.points2;
    return pointsToGo1 <= 14 && pointsToGo2 <= 14;
  }, [match.points1, match.points2, match.pointsToWin1, match.pointsToWin2]);

  const matchWinnerId = useMemo(() => {
    const p1ReachedTarget = match.points1 >= match.pointsToWin1;
    const p2ReachedTarget = match.points2 >= match.pointsToWin2;

    if (!p1ReachedTarget && !p2ReachedTarget) return null;

    if (onTheHill) {
        if (match.games.length > 0) return match.games[match.games.length - 1].winnerId;
    }

    if (p1ReachedTarget) return match.player1Id;
    if (p2ReachedTarget) return match.player2Id;
    
    return null;
  }, [match, onTheHill]);

  const handle8BallGameEnd = (winnerId: number) => {
    setGameWinnerId(winnerId);
    setShow8BallModal(true);
  };
  
  const handle9BallPocket = (pocketerId: number) => {
    if (selectedBall === null) {
        alert("Please select a ball first.");
        return;
    }

    if (pocketerId === match.player1Id) {
        setPocketedByPlayer1(prev => [...prev, selectedBall]);
    } else {
        setPocketedByPlayer2(prev => [...prev, selectedBall]);
    }

    if(selectedBall === 9) {
        const winnerPoints = 14;
        const loserPoints = pocketerId === match.player1Id ? pocketedByPlayer2.length : pocketedByPlayer1.length;
        
        const gameLog: GameLog = {
            gameNumber: match.games.length + 1,
            winnerId: pocketerId,
            points: loserPoints,
        };

        setMatch(prev => ({ 
            ...prev, 
            points1: prev.points1 + (pocketerId === prev.player1Id ? winnerPoints : loserPoints),
            points2: prev.points2 + (pocketerId === prev.player2Id ? winnerPoints : loserPoints),
            games: [...prev.games, gameLog] 
        }));
        
        setPocketedByPlayer1([]);
        setPocketedByPlayer2([]);
        setDeadBalls([]);
    }

    setSelectedBall(null);
  }

  const handleDeadBall = (ballNumber: number) => {
    setDeadBalls(prev => [...prev, ballNumber]);
    if(selectedBall === ballNumber) {
        setSelectedBall(null);
    }
  }

  const handleSave8BallGame = () => {
    if (gameWinnerId === null) return;
    
    const newGameLog: GameLog = {
      gameNumber: match.games.length + 1,
      winnerId: gameWinnerId,
      points: loserScore,
    };

    let newPoints1 = match.points1;
    let newPoints2 = match.points2;

    if (gameWinnerId === match.player1Id) {
        newPoints1 += 14;
        newPoints2 += loserScore;
    } else {
        newPoints2 += 14;
        newPoints1 += loserScore;
    }

    setMatch(prev => ({
      ...prev,
      points1: newPoints1,
      points2: newPoints2,
      games: [...prev.games, newGameLog]
    }));

    setShow8BallModal(false);
    setGameWinnerId(null);
    setLoserScore(0);
  };
  
  const ballColors: { [key: number]: string } = {
    1: 'bg-yellow-400', 2: 'bg-blue-500', 3: 'bg-red-500', 4: 'bg-purple-600',
    5: 'bg-orange-500', 6: 'bg-green-600', 7: 'bg-red-800', 8: 'bg-black', 9: 'bg-yellow-400'
  };

  const availableBalls = [...Array(9).keys()].map(i => i + 1).filter(
      ball => ![...pocketedByPlayer1, ...pocketedByPlayer2, ...deadBalls].includes(ball)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl mx-4 relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">{match.gameType === '8-ball' ? '8-Ball Match' : '9-Ball Match'}</h2>
          <p className="text-gray-500">{match.tournament}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center mb-8">
          <div className="p-6 bg-gray-100 rounded-lg">
            <p className="text-2xl font-bold truncate">{match.player1}</p>
            <p className="text-6xl font-bold text-primary my-2">{Math.max(0, match.pointsToWin1 - match.points1)}</p>
            <p className="text-sm text-gray-500">Points to Go (Score: {match.points1})</p>
            <div className="flex justify-center gap-2 mt-2 h-10">
                {pocketedByPlayer1.map(ball => <Ball key={`p1-${ball}`} number={ball} color={ballColors[ball]} />)}
            </div>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg">
            <p className="text-2xl font-bold truncate">{match.player2}</p>
            <p className="text-6xl font-bold text-primary my-2">{Math.max(0, match.pointsToWin2 - match.points2)}</p>
            <p className="text-sm text-gray-500">Points to Go (Score: {match.points2})</p>
            <div className="flex justify-center gap-2 mt-2 h-10">
                {pocketedByPlayer2.map(ball => <Ball key={`p2-${ball}`} number={ball} color={ballColors[ball]} />)}
            </div>
          </div>
        </div>

        {matchWinnerId === null ? (
            <div className="space-y-4">
                <h3 className="text-center font-semibold text-lg">Game #{match.games.length + 1}</h3>
                {match.gameType === '8-ball' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handle8BallGameEnd(match.player1Id)} className="btn btn-primary py-4 text-lg">{match.player1} Won</button>
                        <button onClick={() => handle8BallGameEnd(match.player2Id)} className="btn btn-primary py-4 text-lg">{match.player2} Won</button>
                    </div>
                ) : (
                    <div className="p-4 border rounded-lg">
                        <label className="block text-center text-sm font-medium text-gray-700 mb-4">1. Select Ball (Double-click to mark dead)</label>
                        <div className="flex justify-center items-center gap-4 flex-wrap mb-4 h-12">
                            {availableBalls.map(ballNum => (
                                <Ball key={ballNum} number={ballNum} color={ballColors[ballNum]} isSelected={selectedBall === ballNum} onClick={() => setSelectedBall(ballNum)} onDoubleClick={() => handleDeadBall(ballNum)} />
                            ))}
                        </div>
                        <label className="block text-center text-sm font-medium text-gray-700 mb-2">2. Assign to Player</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <button onClick={() => handle9BallPocket(match.player1Id)} className="btn btn-primary py-4 text-lg" disabled={selectedBall === null}>{match.player1} Pocketed</button>
                            <button onClick={() => handle9BallPocket(match.player2Id)} className="btn btn-primary py-4 text-lg" disabled={selectedBall === null}>{match.player2}</button>
                        </div>
                    </div>
                )}
                {onTheHill && <p className="text-center text-red-500 font-bold animate-pulse">ON THE HILL - NEXT GAME WINS!</p>}
            </div>
        ) : (
            <div className="text-center p-6 bg-yellow-100 rounded-lg">
                <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4"/>
                <h3 className="text-2xl font-bold">Match Over!</h3>
                <p className="text-xl mt-2">{matchWinnerId === match.player1Id ? match.player1 : match.player2} wins!</p>
                <button onClick={() => onFinalize(match)} className="btn btn-primary mt-6">Finalize & Close</button>
            </div>
        )}
      </div>

      {show8BallModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[110]">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Game #{match.games.length + 1} Result</h3>
                  <p className="mb-2">Winner: <span className="font-bold">{gameWinnerId === match.player1Id ? match.player1 : match.player2}</span></p>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loser's Score (Balls Pocketed):</label>
                  <div className="flex justify-between items-center mb-4">
                      {[...Array(8).keys()].map(i => (
                          <button key={i} onClick={() => setLoserScore(i)} className={`w-8 h-8 rounded-full font-bold ${loserScore === i ? 'bg-primary text-white' : 'bg-gray-200'}`}>{i}</button>
                      ))}
                  </div>

                  <div className="flex space-x-3 pt-4">
                      <button onClick={() => setShow8BallModal(false)} className="flex-1 btn bg-gray-200">Cancel</button>
                      <button onClick={() => handleSave8BallGame()} className="flex-1 btn btn-primary">Save Game</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default LiveScoring;