/**
 * AI Student Database Seeder
 * Run once to populate Firestore with 100 AI students
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, Timestamp } = require('firebase/firestore');

// Firebase config from your project
const firebaseConfig = {
  apiKey: "AIzaSyAf4CsjSud_lH3oOUhBngvIAZNxIWDpS0Q",
  authDomain: "writing-arena.firebaseapp.com",
  databaseURL: "https://writing-arena-default-rtdb.firebaseio.com",
  projectId: "writing-arena",
  storageBucket: "writing-arena.firebasestorage.app",
  messagingSenderId: "774068675032",
  appId: "1:774068675032:web:1426c690e6d34dc93a52ad",
  measurementId: "G-8GZWHR7FKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
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

function generateAIStudentName(index) {
  const firstName = firstNames[index % firstNames.length];
  const lastNameIdx = Math.floor((index * 7) / firstNames.length) % lastNames.length;
  const lastName = lastNames[lastNameIdx];
  const suffix = suffixes[index % suffixes.length];
  
  return suffix ? `${firstName} ${lastName} ${suffix}` : `${firstName} ${lastName}`;
}

function generateRankDistribution(index) {
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

function generateStats(rank) {
  const skillLevel = rank.includes('Bronze') ? 'beginner' :
                     rank.includes('Silver') ? 'intermediate' :
                     rank.includes('Gold') ? 'proficient' :
                     rank.includes('Platinum') ? 'advanced' : 'expert';
  
  const matchesRange = {
    beginner: [5, 30],
    intermediate: [20, 80],
    proficient: [50, 150],
    advanced: [80, 200],
    expert: [100, 300],
  };
  
  const winRateRange = {
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

function generateTraits(rank) {
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

async function seedAIStudents() {
  console.log('🌱 Seeding 100 AI students to Firestore...\n');
  
  const students = [];
  
  for (let i = 0; i < 100; i++) {
    const displayName = generateAIStudentName(i);
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
  
  console.log('📝 Generated 100 AI students');
  console.log('\nSample students:');
  console.log(`  • ${students[0].displayName} (${students[0].currentRank}) - ${students[0].personality}`);
  console.log(`  • ${students[25].displayName} (${students[25].currentRank}) - ${students[25].personality}`);
  console.log(`  • ${students[50].displayName} (${students[50].currentRank}) - ${students[50].personality}`);
  console.log(`  • ${students[75].displayName} (${students[75].currentRank}) - ${students[75].personality}`);
  console.log(`  • ${students[99].displayName} (${students[99].currentRank}) - ${students[99].personality}`);
  
  console.log('\n💾 Writing to Firestore...');
  let successCount = 0;
  
  for (const student of students) {
    try {
      const studentRef = doc(db, 'aiStudents', student.id);
      const now = Timestamp.now();
      
      // Don't include 'id' as a field - it's the document ID
      const { id, ...studentData } = student;
      
      await setDoc(studentRef, {
        ...studentData,
        createdAt: now,
        updatedAt: now,
      });
      successCount++;
      
      if (successCount % 10 === 0) {
        console.log(`  ✅ Saved ${successCount}/100 students...`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to save ${student.displayName}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Seeding complete! ${successCount}/100 AI students saved to Firestore.`);
  
  // Show rank distribution
  console.log('\n📊 Rank Distribution:');
  const rankCounts = {};
  students.forEach(s => {
    const tier = s.currentRank.split(' ')[0];
    rankCounts[tier] = (rankCounts[tier] || 0) + 1;
  });
  Object.entries(rankCounts).forEach(([tier, count]) => {
    console.log(`  ${tier}: ${count} students`);
  });
  
  console.log('\n✅ Database ready for ranked matches!');
  process.exit(0);
}

seedAIStudents().catch(error => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});

