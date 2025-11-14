import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  console.log('🔵 API - Seed endpoint called');
  
  try {
    // Simple authorization check - only proceed if called from admin page
    const referer = request.headers.get('referer');
    console.log('🔵 API - Referer:', referer);
    console.log('🔵 API - NODE_ENV:', process.env.NODE_ENV);
    
    const isFromAdminPage = referer && referer.includes('/admin/seed-database');
    
    if (!isFromAdminPage && process.env.NODE_ENV === 'production') {
      console.log('❌ API - Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized - Access via /admin/seed-database only' },
        { status: 403 }
      );
    }
    
    console.log('✅ API - Authorization passed');
    console.log('🌱 API - Starting AI student generation...');
    
    const students = await generateAIStudents();
    console.log(`✅ API - Generated ${students.length} students`);
    
    console.log('💾 API - Writing to Firestore...');
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (const student of students) {
      try {
        console.log(`🔵 API - Writing student ${successCount + 1}: ${student.displayName}`);
        const studentRef = doc(db, 'aiStudents', student.id);
        await setDoc(studentRef, {
          ...student,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`  ✅ API - Saved ${successCount}/${students.length} students...`);
        }
      } catch (error: any) {
        errorCount++;
        const errorMsg = `Failed to save ${student.displayName}: ${error.message}`;
        console.error(`  ❌ API - ${errorMsg}`);
        errors.push(errorMsg);
        
        // Stop after 3 errors to avoid spamming
        if (errorCount >= 3) {
          console.error('❌ API - Too many errors, stopping');
          break;
        }
      }
    }
    
    console.log(`🎉 API - Seeding complete! ${successCount}/${students.length} AI students saved.`);
    console.log(`❌ API - Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.error('🔴 API - First few errors:', errors.slice(0, 3));
    }
    
    return NextResponse.json({
      success: successCount > 0,
      studentsCreated: successCount,
      total: students.length,
      errorCount,
      errors: errors.slice(0, 5), // Return first 5 errors
      students: students.slice(0, 10), // Return first 10 as sample
    });
    
  } catch (error) {
    console.error('❌ Error seeding AI students:', error);
    return NextResponse.json({ error: 'Failed to seed AI students' }, { status: 500 });
  }
}

async function generateAIStudents() {
  const firstNames = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
    'Blake', 'Skylar', 'Rowan', 'Sage', 'Phoenix', 'River', 'Dakota', 'Kai',
    'Finley', 'Reese', 'Cameron', 'Parker', 'Emerson', 'Harper', 'Hayden', 'Peyton',
    'Drew', 'Logan', 'Ellis', 'Oakley', 'Marlowe', 'Winter', 'Autumn', 'Rain',
    'Storm', 'Echo', 'Luna', 'Sol', 'Nova', 'Orion', 'Astrid', 'Zephyr'
  ];

  const lastNames = [
    'Wordsmith', 'Scribe', 'Page', 'Quill', 'Ink', 'Verse', 'Prose', 'Tale',
    'Story', 'Script', 'Writer', 'Author', 'Poet', 'Bard', 'Sage', 'Chronicle',
    'Narrative', 'Scroll', 'Manuscript', 'Tome', 'Novel', 'Draft', 'Pen', 'Write',
    'Compose', 'Craft', 'Create', 'Imagine', 'Dream', 'Muse'
  ];

  const suffixes = [
    '', '', '', '', '', '', '', '', '', '', // 50% no suffix
    '', '', '', '', '', '', '', '', '', '',
    'Jr', 'The Swift', 'The Wise', 'The Bold', 'The Clever', 'The Creative',
    'The Thoughtful', 'The Skilled', 'The Bright', 'The Curious'
  ];

  const avatars = [
    '🎯', '📖', '✨', '🏅', '⚔️', '📚', '✒️', '📝', '🖊️', '💫',
    '🌟', '⭐', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎮', '🎲',
    '🏆', '🥇', '🥈', '🥉', '🎖️', '🏵️', '🎗️', '👑', '💎', '💍',
    '🌺', '🌸', '🌼', '🌻', '🌷', '🌹', '🥀', '🌴', '🌲', '🌳',
    '🍀', '🍁', '🍂', '🍃', '🌿', '☘️', '🌾', '🌱', '🌵', '🎋',
    '🦋', '🐝', '🐞', '🦜', '🦚', '🦉', '🦅', '🦆', '🐧', '🐦',
    '🔥', '💧', '⚡', '🌊', '🌈', '☀️', '🌙', '⭐', '✨', '💫',
    '🎵', '🎶', '🎼', '🎹', '🎸', '🎺', '🎷', '🥁', '🎻', '🪕',
    '🚀', '🛸', '🌌', '🔭', '🧪', '🔬', '💡', '🔧', '⚙️', '🔩',
    '📡', '💻', '⌨️', '🖱️', '🖥️', '📱', '📲', '☎️', '📞', '📟'
  ];

  const personalities = [
    'Thoughtful and analytical',
    'Creative and imaginative',
    'Detailed and meticulous',
    'Bold and experimental',
    'Methodical and organized',
    'Expressive and emotional',
    'Concise and direct',
    'Elaborate and descriptive',
    'Logical and structured',
    'Artistic and poetic',
    'Practical and straightforward',
    'Abstract and philosophical',
    'Energetic and dynamic',
    'Calm and reflective',
    'Humorous and witty',
    'Serious and formal',
    'Casual and conversational',
    'Academic and scholarly',
    'Narrative-focused',
    'Detail-oriented',
  ];

  const writingStyles = [
    'Descriptive and vivid',
    'Concise and punchy',
    'Flowing and lyrical',
    'Structured and methodical',
    'Creative and unique',
    'Traditional and formal',
    'Conversational and natural',
    'Academic and precise',
    'Narrative-driven',
    'Analytical and critical',
    'Expressive and emotional',
    'Minimalist and clean',
    'Elaborate and detailed',
    'Rhythmic and poetic',
    'Straightforward and clear',
  ];

  const students = [];
  
  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastNameIdx = Math.floor((i * 7) / firstNames.length) % lastNames.length;
    const lastName = lastNames[lastNameIdx];
    const suffix = suffixes[i % suffixes.length];
    
    const displayName = suffix ? `${firstName} ${lastName} ${suffix}` : `${firstName} ${lastName}`;
    const avatar = avatars[i];
    const personality = personalities[i % personalities.length];
    const writingStyle = writingStyles[i % writingStyles.length];
    const rankInfo = generateRankDistribution(i);
    const stats = generateStats(rankInfo.rank);
    const traits = generateTraits(rankInfo.rank);
    
    students.push({
      id: `ai-student-${i.toString().padStart(3, '0')}`,
      displayName,
      personality,
      avatar,
      currentRank: rankInfo.rank,
      rankLP: rankInfo.lp,
      characterLevel: rankInfo.level,
      totalXP: Math.floor(rankInfo.xp),
      stats,
      traits,
      writingStyle,
    });
  }
  
  return students;
}

function generateRankDistribution(index: number): { rank: string; lp: number; level: number; xp: number } {
  // Distribution: 10% Bronze, 30% Silver, 30% Gold, 20% Platinum, 8% Diamond, 2% Master
  
  if (index < 10) {
    const division = ['IV', 'III', 'II', 'I'][index % 4];
    return { rank: `Bronze ${division}`, lp: Math.floor(Math.random() * 100), level: 1, xp: 500 + Math.random() * 500 };
  } else if (index < 40) {
    const division = ['IV', 'III', 'II', 'I'][index % 4];
    return { rank: `Silver ${division}`, lp: Math.floor(Math.random() * 100), level: 2, xp: 1000 + Math.random() * 500 };
  } else if (index < 70) {
    const division = ['IV', 'III', 'II', 'I'][index % 4];
    return { rank: `Gold ${division}`, lp: Math.floor(Math.random() * 100), level: 3, xp: 1500 + Math.random() * 500 };
  } else if (index < 90) {
    const division = ['IV', 'III', 'II', 'I'][index % 4];
    return { rank: `Platinum ${division}`, lp: Math.floor(Math.random() * 100), level: 4, xp: 2000 + Math.random() * 500 };
  } else if (index < 98) {
    const division = ['IV', 'III', 'II', 'I'][index % 4];
    return { rank: `Diamond ${division}`, lp: Math.floor(Math.random() * 100), level: 5, xp: 2500 + Math.random() * 500 };
  } else {
    return { rank: 'Master I', lp: Math.floor(Math.random() * 100), level: 6, xp: 3000 + Math.random() * 500 };
  }
}

function generateStats(rank: string): any {
  const skillLevel = rank.includes('Bronze') ? 'beginner' :
                     rank.includes('Silver') ? 'intermediate' :
                     rank.includes('Gold') ? 'proficient' :
                     rank.includes('Platinum') ? 'advanced' : 'expert';
  
  const matchesRange: Record<string, [number, number]> = {
    beginner: [5, 30],
    intermediate: [20, 80],
    proficient: [50, 150],
    advanced: [80, 200],
    expert: [100, 300],
  };
  
  const winRateRange: Record<string, [number, number]> = {
    beginner: [35, 48],
    intermediate: [45, 55],
    proficient: [52, 62],
    advanced: [58, 68],
    expert: [65, 75],
  };
  
  const range = matchesRange[skillLevel] || [20, 80];
  const wrRange = winRateRange[skillLevel] || [45, 55];
  
  const totalMatches = Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
  const winRate = Math.floor(Math.random() * (wrRange[1] - wrRange[0]) + wrRange[0]);
  const wins = Math.floor((totalMatches * winRate) / 100);
  const losses = totalMatches - wins;
  const totalWords = totalMatches * (80 + Math.random() * 60);
  
  return {
    totalMatches,
    wins,
    losses,
    totalWords: Math.floor(totalWords),
    winRate,
  };
}

function generateTraits(rank: string): any {
  const skillLevel = rank.includes('Bronze') ? 1 :
                     rank.includes('Silver') ? 2 :
                     rank.includes('Gold') ? 3 :
                     rank.includes('Platinum') ? 4 :
                     rank.includes('Diamond') ? 5 : 6;
  
  const variation = () => Math.max(1, skillLevel + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2));
  
  return {
    content: variation(),
    organization: variation(),
    grammar: variation(),
    vocabulary: variation(),
    mechanics: variation(),
  };
}

