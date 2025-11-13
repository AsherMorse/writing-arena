'use client';

interface WaitingForPlayersProps {
  phase: 1 | 2 | 3;
  playersReady: number;
  totalPlayers: number;
  timeRemaining: number;
}

export default function WaitingForPlayers({ 
  phase, 
  playersReady, 
  totalPlayers,
  timeRemaining
}: WaitingForPlayersProps) {
  
  const phaseNames = {
    1: 'Writing',
    2: 'Peer Feedback',
    3: 'Revision',
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Icon */}
        <div className="text-8xl mb-6 animate-bounce">⏳</div>
        
        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-3">
          Waiting for Other Players
        </h1>
        <p className="text-white/70 text-lg mb-8">
          You&apos;ve completed {phaseNames[phase]}!
        </p>
        
        {/* Progress Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-6">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="text-6xl font-bold text-white">{playersReady}</div>
            <div className="text-4xl text-white/40">/</div>
            <div className="text-6xl font-bold text-white/60">{totalPlayers}</div>
          </div>
          <div className="text-white/80 mb-4">Players Ready</div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-blue-500 transition-all duration-500 rounded-full"
              style={{ width: `${(playersReady / totalPlayers) * 100}%` }}
            />
          </div>
          
          {/* Player Status */}
          <div className="grid grid-cols-5 gap-2">
            {[...Array(totalPlayers)].map((_, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg transition-all ${
                  index < playersReady
                    ? 'bg-green-500/20 border-2 border-green-400'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="text-2xl">
                  {index < playersReady ? '✓' : '⏳'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Time Remaining */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6">
          <div className="text-white/80 text-sm mb-2">Phase will end automatically in</div>
          <div className="text-4xl font-bold text-white mb-2">
            {formatTime(timeRemaining)}
          </div>
          <div className="text-white/70 text-sm">
            Or when all players finish
          </div>
        </div>
        
        {/* Fun Message */}
        <div className="mt-6 text-white/60 text-sm">
          <p>✨ Great job finishing! Others are still working on their {phaseNames[phase].toLowerCase()}...</p>
        </div>
      </div>
    </div>
  );
}

