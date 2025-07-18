import React, { useState, useMemo, useEffect } from 'react';
import { Match, GameLog, Player, Team } from '../types';
import { X, Trophy } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, runTransaction } from 'firebase/firestore';

interface LiveScoringProps {
  matchId: string;
  onFinalize: () => void;
  onCancel: () => void;
}

// Helper functions for rating calculations
const K_FACTOR = 32;
const getExpectedScore = (ratingA: number, ratingB: number): number => 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
const getNewRating = (rating: number, actual: number, expected: number): number => Math.round(rating + K_FACTOR * (actual - expected));

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

const LiveScoring: React.FC<LiveScoringProps> = ({ matchId, onFinalize, onCancel }) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [show8BallModal, setShow8BallModal] = useState(false);
  const [gameWinnerId, setGameWinnerId] = useState<string | null>(null);
  const [loserScore, setLoserScore] = useState(0);
  
  const [selectedBall, setSelectedBall] = useState<number | null>(null);
  const [pocketedByPlayer1, setPocketedByPlayer1] = useState<number[]>([]);
  const [pocketedByPlayer2, setPocketedByPlayer2] = useState<number[]>([]);
  const [deadBalls, setDeadBalls] = useState<number[]>([]);

  useEffect(() => {
    if (!matchId) return;
    const matchDocRef = doc(db, "matches", matchId);
    
    const unsubscribe = onSnapshot(matchDocRef, (doc) => {
      if (doc.exists()) {
        setMatch({ id: doc.id, ...doc.data() } as Match);
      } else {
        console.error("No such match document!");
        onCancel();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [matchId, onCancel]);

  const updateMatchInDb = async (updatedFields: Partial<Match>) => {
    if (!matchId) return;
    const matchDocRef = doc(db, "matches", matchId);
    await updateDoc(matchDocRef, updatedFields);
  };

  const onTheHill = useMemo(() => {
    if (!match) return false;
    const pointsToGo1 = match.pointsToWin1 - match.score1;
    const pointsToGo2 = match.pointsToWin2 - match.score2;
    return pointsToGo1 <= 14 && pointsToGo2 <= 14;
  }, [match]);

  const matchWinnerId = useMemo(() => {
    if (!match) return null;
    if (match.score1 >= match.pointsToWin1) return match.player1Id;
    if (match.score2 >= match.pointsToWin2) return match.player2Id;
    return null;
  }, [match]);

  const handle8BallGameEnd = (winnerId: string) => {
    setGameWinnerId(winnerId);
    setShow8BallModal(true);
  };

  const handle9BallPocket = async (pocketerId: string) => {
    if (!match || selectedBall === null) return;

    const pocketedByP1 = [...pocketedByPlayer1];
    const pocketedByP2 = [...pocketedByPlayer2];

    if (pocketerId === match.player1Id) {
        pocketedByP1.push(selectedBall);
        setPocketedByPlayer1(pocketedByP1);
    } else {
        pocketedByP2.push(selectedBall);
        setPocketedByPlayer2(pocketedByP2);
    }

    if(selectedBall === 9) {
        const winnerPoints = 14;
        const loserPoints = pocketerId === match.player1Id ? pocketedByP2.length : pocketedByP1.length;
        
        const gameLog: GameLog = {
            gameNumber: match.games.length + 1,
            winnerId: pocketerId,
            points: loserPoints,
        };

        const newScore1 = match.score1 + (pocketerId === match.player1Id ? winnerPoints : loserPoints);
        const newScore2 = match.score2 + (pocketerId === match.player2Id ? winnerPoints : loserPoints);

        await updateMatchInDb({
            score1: newScore1,
            score2: newScore2,
            games: [...match.games, gameLog]
        });
        
        // Reset game state
        setPocketedByPlayer1([]);
        setPocketedByPlayer2([]);
        setDeadBalls([]);
    }

    setSelectedBall(null);
  };

  const handleDeadBall = (ballNumber: number) => {
    if (ballNumber === 9) return;
    
    setDeadBalls(prev => [...prev, ballNumber]);
    if(selectedBall === ballNumber) {
        setSelectedBall(null);
    }
  };
  
  const handleSave8BallGame = async () => {
    if (!match || gameWinnerId === null) return;
    
    const newGameLog: GameLog = {
      gameNumber: match.games.length + 1,
      winnerId: gameWinnerId,
      points: loserScore,
    };

    const newScore1 = match.score1 + (gameWinnerId === match.player1Id ? 14 : loserScore);
    const newScore2 = match.score2 + (gameWinnerId === match.player2Id ? 14 : loserScore);

    await updateMatchInDb({
      score1: newScore1,
      score2: newScore2,
      games: [...match.games, newGameLog]
    });

    setShow8BallModal(false);
    setGameWinnerId(null);
    setLoserScore(0);
  };
  
  const handleFinalizeMatch = async () => {
    if (!match || !matchWinnerId) return;

    try {
      await runTransaction(db, async (transaction) => {
        const player1Ref = doc(db, "players", match.player1Id);
        const player2Ref = doc(db, "players", match.player2Id);
        const player1Snap = await transaction.get(player1Ref);
        const player2Snap = await transaction.get(player2Ref);

        let team1Ref, team2Ref, team1Snap, team2Snap;
        if (match.team1Id) team1Ref = doc(db, "teams", match.team1Id);
        if (match.team2Id) team2Ref = doc(db, "teams", match.team2Id);
        if (team1Ref) team1Snap = await transaction.get(team1Ref);
        if (team2Ref) team2Snap = await transaction.get(team2Ref);

        if (!player1Snap.exists() || !player2Snap.exists()) {
          throw new Error("Player not found during transaction.");
        }
        
        const player1 = player1Snap.data() as Player;
        const player2 = player2Snap.data() as Player;

        const expectedScore1 = getExpectedScore(player1.rating, player2.rating);
        const newRating1 = getNewRating(player1.rating, matchWinnerId === match.player1Id ? 1 : 0, expectedScore1);
        const newRating2 = getNewRating(player2.rating, matchWinnerId === match.player2Id ? 1 : 0, 1 - expectedScore1);
        
        const matchesField = `matches${match.gameType === '8-ball' ? '8Ball' : '9Ball'}`;
        const winsField = `wins${match.gameType === '8-ball' ? '8Ball' : '9Ball'}`;

        const p1UpdateData = {
          rating: newRating1,
          previousRating: player1.rating,
          [matchesField]: (player1[matchesField as keyof Player] as number || 0) + 1,
          [winsField]: (player1[winsField as keyof Player] as number || 0) + (matchWinnerId === match.player1Id ? 1 : 0),
        };

        const p2UpdateData = {
          rating: newRating2,
          previousRating: player2.rating,
          [matchesField]: (player2[matchesField as keyof Player] as number || 0) + 1,
          [winsField]: (player2[winsField as keyof Player] as number || 0) + (matchWinnerId === match.player2Id ? 1 : 0),
        };

        transaction.update(player1Ref, p1UpdateData);
        transaction.update(player2Ref, p2UpdateData);

        if (team1Ref && team1Snap?.exists() && team2Ref && team2Snap?.exists()) {
            const team1 = team1Snap.data();
            const team2 = team2Snap.data();
            const suffix = match.gameType === '8-ball' ? '8Ball' : '9Ball';
            const pointsField = `points${suffix}`;
            const teamWinsField = `wins${suffix}`;
            const teamMatchesField = `matchesPlayed${suffix}`;

            transaction.update(team1Ref, {
              [pointsField]: (team1[pointsField] || 0) + match.score1,
              [teamMatchesField]: (team1[teamMatchesField] || 0) + 1,
              [teamWinsField]: (team1[teamWinsField] || 0) + (matchWinnerId === match.player1Id ? 1 : 0)
            });

            transaction.update(team2Ref, {
              [pointsField]: (team2[pointsField] || 0) + match.score2,
              [teamMatchesField]: (team2[teamMatchesField] || 0) + 1,
              [teamWinsField]: (team2[teamWinsField] || 0) + (matchWinnerId === match.player2Id ? 1 : 0)
            });
        }

        const matchRef = doc(db, "matches", match.id);
        transaction.update(matchRef, { status: 'completed', score: `${match.score1} - ${match.score2}` });
      });

      onFinalize();
    } catch (error) {
      console.error("Transaction failed: ", error);
      alert("Failed to finalize match. Please try again.");
    }
  };

  const ballColors: { [key: number]: string } = {
    1: 'bg-yellow-400', 2: 'bg-blue-500', 3: 'bg-red-500', 4: 'bg-purple-600',
    5: 'bg-orange-500', 6: 'bg-green-600', 7: 'bg-red-800', 8: 'bg-black', 9: 'bg-yellow-400'
  };
  
  const availableBalls = useMemo(() => {
    if (!match) return [];
    return [...Array(9).keys()].map(i => i + 1).filter(
        ball => ![...pocketedByPlayer1, ...pocketedByPlayer2, ...deadBalls].includes(ball)
    );
  }, [pocketedByPlayer1, pocketedByPlayer2, deadBalls, match]);

  if (loading || !match) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
        <div className="text-white font-bold text-xl">Loading Live Match...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">{match.gameType === '8-ball' ? '8-Ball Match' : '9-Ball Match'}</h2>
          {match.tournament && <p className="text-gray-500">{match.tournament}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 text-center mb-8">
          <div className="p-6 bg-gray-100 rounded-lg">
            <p className="text-2xl font-bold truncate">{match.player1Name}</p>
            <p className="text-6xl font-bold text-primary my-2">{Math.max(0, match.pointsToWin1 - match.score1)}</p>
            <p className="text-sm text-gray-500">Points to Go (Score: {match.score1})</p>
            <div className="flex justify-center gap-2 mt-2 h-10">
                {pocketedByPlayer1.map(ball => (
                  <Ball key={`p1-${ball}`} number={ball} color={ballColors[ball]} />
                ))}
            </div>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg">
            <p className="text-2xl font-bold truncate">{match.player2Name}</p>
            <p className="text-6xl font-bold text-primary my-2">{Math.max(0, match.pointsToWin2 - match.score2)}</p>
            <p className="text-sm text-gray-500">Points to Go (Score: {match.score2})</p>
            <div className="flex justify-center gap-2 mt-2 h-10">
                {pocketedByPlayer2.map(ball => (
                  <Ball key={`p2-${ball}`} number={ball} color={ballColors[ball]} />
                ))}
            </div>
          </div>
        </div>

        {matchWinnerId ? (
          <div className="text-center p-6 bg-yellow-100 rounded-lg">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4"/>
            <h3 className="text-2xl font-bold">Match Over!</h3>
            <p className="text-xl mt-2">{matchWinnerId === match.player1Id ? match.player1Name : match.player2Name} wins!</p>
            <button onClick={handleFinalizeMatch} className="btn btn-primary mt-6">Finalize & Update Stats</button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-center font-semibold text-lg">Game #{match.games.length + 1}</h3>
            {match.gameType === '8-ball' ? (
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handle8BallGameEnd(match.player1Id)} className="btn btn-primary py-4 text-lg">
                        {match.player1Name} Won
                    </button>
                    <button onClick={() => handle8BallGameEnd(match.player2Id)} className="btn btn-primary py-4 text-lg">
                        {match.player2Name} Won
                    </button>
                </div>
            ) : (
                <div className="p-4 border rounded-lg">
                    <label className="block text-center text-sm font-medium text-gray-700 mb-4">
                        1. Select Ball (Double-click to mark dead)
                    </label>
                    <div className="flex justify-center items-center gap-4 flex-wrap mb-4 h-12">
                        {availableBalls.map(ballNum => (
                            <Ball 
                                key={ballNum} 
                                number={ballNum} 
                                color={ballColors[ballNum]} 
                                isSelected={selectedBall === ballNum} 
                                onClick={() => setSelectedBall(ballNum)} 
                                onDoubleClick={ballNum !== 9 ? () => handleDeadBall(ballNum) : undefined}
                                isDead={deadBalls.includes(ballNum)}
                            />
                        ))}
                    </div>
                    <label className="block text-center text-sm font-medium text-gray-700 mb-2">
                        2. Assign to Player
                    </label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <button 
                            onClick={() => handle9BallPocket(match.player1Id)} 
                            className="btn btn-primary py-4 text-lg" 
                            disabled={selectedBall === null}
                        >
                            {match.player1Name} Pocketed
                        </button>
                        <button 
                            onClick={() => handle9BallPocket(match.player2Id)} 
                            className="btn btn-primary py-4 text-lg" 
                            disabled={selectedBall === null}
                        >
                            {match.player2Name} Pocketed
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>

      {show8BallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[101]">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Game #{match?.games.length + 1 || 1} Result</h3>
                <p className="mb-2">Winner: <span className="font-bold">
                    {gameWinnerId === match?.player1Id ? match?.player1Name : match?.player2Name}
                </span></p>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loser's Score (Balls Pocketed):
                </label>
                <div className="flex justify-between items-center mb-4">
                    {[...Array(8).keys()].map(i => (
                        <button 
                            key={i} 
                            onClick={() => setLoserScore(i)} 
                            className={`w-8 h-8 rounded-full font-bold ${loserScore === i ? 'bg-primary text-white' : 'bg-gray-200'}`}
                        >
                            {i}
                        </button>
                    ))}
                </div>

                <div className="flex space-x-3 pt-4">
                    <button onClick={() => setShow8BallModal(false)} className="flex-1 btn bg-gray-200">
                        Cancel
                    </button>
                    <button onClick={handleSave8BallGame} className="flex-1 btn btn-primary">
                        Save Game
                    </button>
                </div>
              </div>
        </div>
      )}
    </div>
  );
};

export default LiveScoring;
