'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export default function SeedDatabasePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // Only allow roger.hunt@superbuilders.school
  const isAuthorized = user?.email === 'roger.hunt@superbuilders.school';

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-white/70 mb-6">You must be logged in to seed the database.</p>
          <button
            onClick={() => router.push('/auth')}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-red-500/30 max-w-md text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-white/70 mb-2">This page is restricted to administrators only.</p>
          <p className="text-white/50 text-sm mb-6">Your email: {user.email}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSeed = async () => {
    console.log('🔵 CLIENT - Starting seed process (client-side writes)');
    setSeeding(true);
    setProgress('Generating 100 AI students...');
    setError('');
    setResult(null);

    try {
      // Generate students client-side
      const students = generateAIStudents();
      console.log(`✅ CLIENT - Generated ${students.length} students`);
      
      setProgress('Writing to Firestore... (this may take 30-60 seconds)');
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      // Write to Firestore from client (has auth context!)
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        
        try {
          const studentRef = doc(db, 'aiStudents', student.id);
          const now = Timestamp.now();
          
          await setDoc(studentRef, {
            displayName: student.displayName,
            personality: student.personality,
            avatar: student.avatar,
            currentRank: student.currentRank,
            rankLP: student.rankLP,
            characterLevel: student.characterLevel,
            totalXP: student.totalXP,
            stats: student.stats,
            traits: student.traits,
            writingStyle: student.writingStyle,
            createdAt: now,
            updatedAt: now,
          });
          
          successCount++;
          
          if (successCount % 10 === 0) {
            console.log(`✅ CLIENT - Saved ${successCount}/${students.length} students...`);
            setProgress(`Writing to Firestore... ${successCount}/${students.length} complete`);
          }
        } catch (error: any) {
          errorCount++;
          const errorMsg = `Failed to save ${student.displayName}: ${error.message}`;
          console.error(`❌ CLIENT - ${errorMsg}`);
          errors.push(errorMsg);
          
          if (errorCount >= 3) {
            console.error('❌ CLIENT - Too many errors, stopping');
            throw new Error(`Too many errors (${errorCount}). Check Firestore rules.`);
          }
        }
      }
      
      console.log(`🎉 CLIENT - Seeding complete! ${successCount}/${students.length} students saved`);
      setProgress('Complete!');
      
      setResult({
        success: successCount > 0,
        studentsCreated: successCount,
        total: students.length,
        errorCount,
        errors,
        students: students.slice(0, 10),
      });
      
    } catch (err: any) {
      console.error('🔴 CLIENT - Seeding error:', err);
      setError(err.message || 'Failed to seed database');
      setProgress('Failed');
    } finally {
      setSeeding(false);
    }
  };

  // Generate AI students client-side
  function generateAIStudents() {
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
      'Thoughtful and analytical', 'Creative and imaginative', 'Detailed and meticulous',
      'Bold and experimental', 'Methodical and organized', 'Expressive and emotional',
      'Concise and direct', 'Elaborate and descriptive', 'Logical and structured',
      'Artistic and poetic', 'Practical and straightforward', 'Abstract and philosophical',
      'Energetic and dynamic', 'Calm and reflective', 'Humorous and witty',
      'Serious and formal', 'Casual and conversational', 'Academic and scholarly',
      'Narrative-focused', 'Detail-oriented',
    ];

    const writingStyles = [
      'Descriptive and vivid', 'Concise and punchy', 'Flowing and lyrical',
      'Structured and methodical', 'Creative and unique', 'Traditional and formal',
      'Conversational and natural', 'Academic and precise', 'Narrative-driven',
      'Analytical and critical', 'Expressive and emotional', 'Minimalist and clean',
      'Elaborate and detailed', 'Rhythmic and poetic', 'Straightforward and clear',
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

  function generateRankDistribution(index: number) {
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

  function generateStats(rank: string) {
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

  function generateTraits(rank: string) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">Seed AI Students Database</h1>
          <p className="text-white/70 mb-6">
            This will create 100 AI students in Firestore. Only run this once!
          </p>

          <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-400">⚠️</span>
              <div className="text-white/80 text-sm">
                <span className="font-semibold text-yellow-400">Warning:</span> This will create 100 documents in Firestore. 
                Only run once per database. Check Firestore first to see if aiStudents collection already exists.
              </div>
            </div>
          </div>

          {!result && !error && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className={`w-full px-6 py-4 font-bold text-lg rounded-xl transition-all ${
                seeding
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:scale-105'
              }`}
            >
              {seeding ? 'Seeding Database...' : 'Start Seeding'}
            </button>
          )}

          {progress && (
            <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                {seeding && <div className="text-2xl animate-spin">🌱</div>}
                {!seeding && result && <div className="text-2xl">✅</div>}
                {!seeding && error && <div className="text-2xl">❌</div>}
                <div className="text-white">{progress}</div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <div className="text-red-400 font-semibold mb-2">Error:</div>
              <div className="text-white/90 text-sm">{error}</div>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <div className={`${result.studentsCreated > 0 ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'} border rounded-lg p-6`}>
                <div className={`${result.studentsCreated > 0 ? 'text-green-400' : 'text-red-400'} font-bold text-xl mb-4`}>
                  {result.studentsCreated > 0 ? '✅ Seeding Successful!' : '❌ Seeding Failed'}
                </div>
                <div className="space-y-2 text-white/90">
                  <div>Total Students Created: <span className={`font-bold ${result.studentsCreated > 0 ? 'text-green-400' : 'text-red-400'}`}>{result.studentsCreated}</span></div>
                  <div>Expected Total: <span className="font-bold">{result.total}</span></div>
                  {result.errorCount > 0 && (
                    <div>Errors: <span className="font-bold text-red-400">{result.errorCount}</span></div>
                  )}
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6">
                  <h3 className="text-red-400 font-bold mb-3">Errors Encountered:</h3>
                  <div className="space-y-1 text-white/80 text-sm">
                    {result.errors.map((err: string, idx: number) => (
                      <div key={idx} className="font-mono text-xs">• {err}</div>
                    ))}
                  </div>
                  <div className="mt-3 text-white/60 text-xs">
                    Check browser console for full error details
                  </div>
                </div>
              )}

              {result.students && result.students.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <h3 className="text-white font-bold mb-4">Sample AI Students Created:</h3>
                  <div className="space-y-3">
                    {result.students.slice(0, 5).map((student: any, idx: number) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{student.avatar}</span>
                          <div className="flex-1">
                            <div className="text-white font-semibold">{student.displayName}</div>
                            <div className="text-white/60 text-xs">
                              {student.currentRank} • {student.personality}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:scale-105 transition-all"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => router.push('/ranked')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:scale-105 transition-all"
                >
                  Play Ranked Match
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

