import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Player } from './types';

export const updateTeamStats = async (playerId: string, newTeamId: string | null, oldTeamId: string | null) => {
  try {
    const playerRef = doc(db, "players", playerId);
    const playerSnap = await getDoc(playerRef);
    
    if (!playerSnap.exists()) return;

    const player = playerSnap.data() as Player;
    
    // Remove player from old team stats
    if (oldTeamId) {
      const oldTeamRef = doc(db, "teams", oldTeamId);
      const oldTeamSnap = await getDoc(oldTeamRef);
      
      if (oldTeamSnap.exists()) {
        const oldTeam = oldTeamSnap.data();
        const update = {
          points8Ball: (oldTeam.points8Ball || 0) - (player.points8Ball || 0),
          wins8Ball: (oldTeam.wins8Ball || 0) - (player.wins8Ball || 0),
          matchesPlayed8Ball: (oldTeam.matchesPlayed8Ball || 0) - (player.matches8Ball || 0),
          points9Ball: (oldTeam.points9Ball || 0) - (player.points9Ball || 0),
          wins9Ball: (oldTeam.wins9Ball || 0) - (player.wins9Ball || 0),
          matchesPlayed9Ball: (oldTeam.matchesPlayed9Ball || 0) - (player.matches9Ball || 0),
        };
        
        await updateDoc(oldTeamRef, update);
      }
    }
    
    // Add player to new team stats
    if (newTeamId) {
      const newTeamRef = doc(db, "teams", newTeamId);
      const newTeamSnap = await getDoc(newTeamRef);
      
      if (newTeamSnap.exists()) {
        const newTeam = newTeamSnap.data();
        const update = {
          points8Ball: (newTeam.points8Ball || 0) + (player.points8Ball || 0),
          wins8Ball: (newTeam.wins8Ball || 0) + (player.wins8Ball || 0),
          matchesPlayed8Ball: (newTeam.matchesPlayed8Ball || 0) + (player.matches8Ball || 0),
          points9Ball: (newTeam.points9Ball || 0) + (player.points9Ball || 0),
          wins9Ball: (newTeam.wins9Ball || 0) + (player.wins9Ball || 0),
          matchesPlayed9Ball: (newTeam.matchesPlayed9Ball || 0) + (player.matches9Ball || 0),
        };
        
        await updateDoc(newTeamRef, update);
      }
    }
  } catch (error) {
    console.error("Error updating team stats: ", error);
    throw new Error("Failed to update team statistics");
  }
};