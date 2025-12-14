import { db } from '../config/firebase';
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
import { AIStudent } from '@/lib/types';

export async function getRandomAIStudents(
  targetRank: string,
  count: number = 4
): Promise<AIStudent[]> {
  try {
    const rankTier = targetRank.split(' ')[0];
    const aiStudentsRef = collection(db, 'aiStudents');
    
    const adjacentTiers = getAdjacentRankTiers(rankTier);
    
    const queries = adjacentTiers.map(tier => 
      getDocs(query(
        aiStudentsRef,
        where('currentRank', '>=', `${tier} I`),
        where('currentRank', '<=', `${tier} IV`),
        limit(20)
      ))
    );
    
    const snapshots = await Promise.all(queries);
    const allStudents = snapshots.flatMap(snapshot =>
      snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIStudent))
    );
    
    if (allStudents.length === 0) {
      return [];
    }
    
    const shuffled = allStudents.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    return selected;
    
  } catch (error) {
    return [];
  }
}

export async function updateAIStudentAfterMatch(
  aiStudentId: string,
  lpChange: number,
  xpEarned: number,
  isWin: boolean,
  wordCount: number
): Promise<void> {
  try {
    const studentRef = doc(db, 'aiStudents', aiStudentId);
    const studentSnap = await getDoc(studentRef);
    
    if (!studentSnap.exists()) {
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
    
    const newWins = isWin ? student.stats.wins + 1 : student.stats.wins;
    const newTotal = student.stats.totalMatches + 1;
    updates['stats.winRate'] = Math.round((newWins / newTotal) * 100);
    
    const newLP = Math.max(0, student.rankLP + lpChange);
    if (newLP >= 100 && student.rankLP < 100) {
      const newRank = promoteRank(student.currentRank);
      updates.currentRank = newRank;
      updates.rankLP = newLP - 100;
    } else if (newLP < 0 && student.rankLP >= 0) {
      const newRank = demoteRank(student.currentRank);
      updates.currentRank = newRank;
      updates.rankLP = 100 + newLP;
    }
    
    await updateDoc(studentRef, updates);
    
  } catch (error) {
    // Silent fail
  }
}

function getAdjacentRankTiers(rankTier: string): string[] {
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];
  const index = tiers.indexOf(rankTier);
  
  if (index === -1) return ['Silver'];
  
  const result = [rankTier];
  if (index > 0) result.unshift(tiers[index - 1]);
  if (index < tiers.length - 1) result.push(tiers[index + 1]);
  
  return result;
}

export function promoteRank(currentRank: string): string {
  const [tier, division] = currentRank.split(' ');
  const divisionNum = ['I', 'II', 'III', 'IV'].indexOf(division);
  
  if (divisionNum === 0) {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'];
    const tierIndex = tiers.indexOf(tier);
    if (tierIndex < tiers.length - 1) {
      return `${tiers[tierIndex + 1]} IV`;
    }
    return currentRank;
  } else {
    return `${tier} ${['I', 'II', 'III', 'IV'][divisionNum - 1]}`;
  }
}

export function demoteRank(currentRank: string): string {
  const [tier, division] = currentRank.split(' ');
  const divisionNum = ['I', 'II', 'III', 'IV'].indexOf(division);
  
  if (divisionNum === 3) {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'];
    const tierIndex = tiers.indexOf(tier);
    if (tierIndex > 0) {
      return `${tiers[tierIndex - 1]} I`;
    }
    return currentRank;
  } else {
    return `${tier} ${['I', 'II', 'III', 'IV'][divisionNum + 1]}`;
  }
}

export async function getAIStudent(aiStudentId: string): Promise<AIStudent | null> {
  try {
    const studentRef = doc(db, 'aiStudents', aiStudentId);
    const studentSnap = await getDoc(studentRef);
    
    if (studentSnap.exists()) {
      return { id: studentSnap.id, ...studentSnap.data() } as AIStudent;
    }
  } catch (error) {
    // Silent fail
  }
  
  return null;
}
