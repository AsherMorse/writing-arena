import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  limit,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

export interface AIStudent {
  id: string;
  displayName: string;
  personality: string;
  avatar: string;
  currentRank: string;
  rankLP: number;
  characterLevel: number;
  totalXP: number;
  stats: {
    totalMatches: number;
    wins: number;
    losses: number;
    totalWords: number;
    winRate: number;
  };
  traits: {
    content: number;
    organization: number;
    grammar: number;
    vocabulary: number;
    mechanics: number;
  };
  writingStyle: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Get random AI students within rank range
export async function getRandomAIStudents(
  targetRank: string,
  count: number = 4
): Promise<AIStudent[]> {
  console.log('🤖 AI STUDENTS - Finding', count, 'AI students near rank:', targetRank);
  
  try {
    const rankTier = targetRank.split(' ')[0]; // e.g., "Silver"
    const aiStudentsRef = collection(db, 'aiStudents');
    
    // Query for AI students in same or adjacent rank tiers
    const adjacentTiers = getAdjacentRankTiers(rankTier);
    
    // Get all AI students in those tiers
    const queries = adjacentTiers.map(tier => 
      getDocs(query(
        aiStudentsRef,
        where('currentRank', '>=', `${tier} I`),
        where('currentRank', '<=', `${tier} IV`),
        limit(20)
      ))
    );
    
    const snapshots = await Promise.all(queries);
    const allStudents: AIStudent[] = [];
    
    snapshots.forEach(snapshot => {
      snapshot.forEach(doc => {
        allStudents.push({ id: doc.id, ...doc.data() } as AIStudent);
      });
    });
    
    if (allStudents.length === 0) {
      console.warn('⚠️ AI STUDENTS - No AI students found, using fallback');
      return [];
    }
    
    // Randomly select the requested number
    const shuffled = allStudents.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    console.log('✅ AI STUDENTS - Selected:', selected.map(s => s.displayName).join(', '));
    return selected;
    
  } catch (error) {
    console.error('❌ AI STUDENTS - Error fetching:', error);
    return [];
  }
}

// Update AI student stats after match
export async function updateAIStudentAfterMatch(
  aiStudentId: string,
  lpChange: number,
  xpEarned: number,
  isWin: boolean,
  wordCount: number
): Promise<void> {
  console.log('📊 AI STUDENTS - Updating:', aiStudentId, { lpChange, xpEarned, isWin });
  
  try {
    const studentRef = doc(db, 'aiStudents', aiStudentId);
    const studentSnap = await getDoc(studentRef);
    
    if (!studentSnap.exists()) {
      console.warn('⚠️ AI STUDENTS - Student not found:', aiStudentId);
      return;
    }
    
    const student = studentSnap.data() as AIStudent;
    
    const updates: any = {
      totalXP: student.totalXP + xpEarned,
      rankLP: Math.max(0, student.rankLP + lpChange),
      'stats.totalMatches': student.stats.totalMatches + 1,
      'stats.totalWords': student.stats.totalWords + wordCount,
      updatedAt: serverTimestamp(),
    };
    
    if (isWin) {
      updates['stats.wins'] = student.stats.wins + 1;
    } else {
      updates['stats.losses'] = student.stats.losses + 1;
    }
    
    // Recalculate win rate
    const newWins = isWin ? student.stats.wins + 1 : student.stats.wins;
    const newTotal = student.stats.totalMatches + 1;
    updates['stats.winRate'] = Math.round((newWins / newTotal) * 100);
    
    // Check for rank up/down (every 100 LP)
    const newLP = Math.max(0, student.rankLP + lpChange);
    if (newLP >= 100 && student.rankLP < 100) {
      // Rank up!
      const newRank = promoteRank(student.currentRank);
      updates.currentRank = newRank;
      updates.rankLP = newLP - 100;
      console.log('⬆️ AI STUDENTS - Rank up!', student.displayName, '→', newRank);
    } else if (newLP < 0 && student.rankLP >= 0) {
      // Rank down
      const newRank = demoteRank(student.currentRank);
      updates.currentRank = newRank;
      updates.rankLP = 100 + newLP;
      console.log('⬇️ AI STUDENTS - Rank down!', student.displayName, '→', newRank);
    }
    
    await updateDoc(studentRef, updates);
    console.log('✅ AI STUDENTS - Updated successfully');
    
  } catch (error) {
    console.error('❌ AI STUDENTS - Error updating:', error);
  }
}

// Helper: Get adjacent rank tiers for matchmaking
function getAdjacentRankTiers(rankTier: string): string[] {
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];
  const index = tiers.indexOf(rankTier);
  
  if (index === -1) return ['Silver']; // Default
  
  // Return current tier and adjacent ones
  const result = [rankTier];
  if (index > 0) result.unshift(tiers[index - 1]); // Lower tier
  if (index < tiers.length - 1) result.push(tiers[index + 1]); // Higher tier
  
  return result;
}

// Helper: Promote rank
function promoteRank(currentRank: string): string {
  const [tier, division] = currentRank.split(' ');
  const divisionNum = ['I', 'II', 'III', 'IV'].indexOf(division);
  
  if (divisionNum === 0) {
    // Promote to next tier
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'];
    const tierIndex = tiers.indexOf(tier);
    if (tierIndex < tiers.length - 1) {
      return `${tiers[tierIndex + 1]} IV`;
    }
    return currentRank; // Already at top
  } else {
    // Promote within tier
    return `${tier} ${['I', 'II', 'III', 'IV'][divisionNum - 1]}`;
  }
}

// Helper: Demote rank
function demoteRank(currentRank: string): string {
  const [tier, division] = currentRank.split(' ');
  const divisionNum = ['I', 'II', 'III', 'IV'].indexOf(division);
  
  if (divisionNum === 3) {
    // Demote to previous tier
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'];
    const tierIndex = tiers.indexOf(tier);
    if (tierIndex > 0) {
      return `${tiers[tierIndex - 1]} I`;
    }
    return currentRank; // Already at bottom
  } else {
    // Demote within tier
    return `${tier} ${['I', 'II', 'III', 'IV'][divisionNum + 1]}`;
  }
}

// Get AI student by ID
export async function getAIStudent(aiStudentId: string): Promise<AIStudent | null> {
  try {
    const studentRef = doc(db, 'aiStudents', aiStudentId);
    const studentSnap = await getDoc(studentRef);
    
    if (studentSnap.exists()) {
      return { id: studentSnap.id, ...studentSnap.data() } as AIStudent;
    }
  } catch (error) {
    console.error('❌ AI STUDENTS - Error fetching:', error);
  }
  
  return null;
}

