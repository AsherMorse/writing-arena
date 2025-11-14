'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SeedDatabasePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

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

  const handleSeed = async () => {
    setSeeding(true);
    setProgress('Starting database seed...');
    setError('');
    setResult(null);

    try {
      setProgress('Calling seed API endpoint...');
      
      const response = await fetch('/api/seed-ai-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setProgress('Processing response...');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setProgress('Complete!');
      setResult(data);
      
    } catch (err: any) {
      console.error('Seeding error:', err);
      setError(err.message || 'Failed to seed database');
      setProgress('Failed');
    } finally {
      setSeeding(false);
    }
  };

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
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6">
                <div className="text-green-400 font-bold text-xl mb-4">✅ Seeding Successful!</div>
                <div className="space-y-2 text-white/90">
                  <div>Total Students Created: <span className="font-bold text-green-400">{result.studentsCreated}</span></div>
                  <div>Expected Total: <span className="font-bold">{result.total}</span></div>
                </div>
              </div>

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

