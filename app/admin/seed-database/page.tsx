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
    console.log('🔵 CLIENT - Starting seed process');
    setSeeding(true);
    setProgress('Starting database seed...');
    setError('');
    setResult(null);

    try {
      console.log('🔵 CLIENT - Calling API endpoint');
      setProgress('Calling seed API endpoint...');
      
      const response = await fetch('/api/seed-ai-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🔵 CLIENT - Got response, status:', response.status);
      setProgress('Processing response...');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('🔵 CLIENT - Seed response:', data);
      
      if (data.errorCount > 0) {
        setProgress(`Complete with ${data.errorCount} errors`);
        console.error('🔴 CLIENT - Errors occurred:', data.errors);
      } else {
        setProgress('Complete!');
      }
      
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

