import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✍️</span>
            </div>
            <span className="text-2xl font-bold text-white">Writing Arena</span>
          </div>
          <Link 
            href="/dashboard"
            className="px-6 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
          >
            Sign In
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20">
            <span className="text-sm text-white/90">🎮 Competitive Writing Platform for Grades 1-12</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Level Up Your
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-transparent bg-clip-text">
              Writing Skills
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Compete in 4-minute writing matches. Battle with AI-powered feedback. 
            Rise through the ranks from Seedling to Legendary Writer.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-lg font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 w-full sm:w-auto"
            >
              Start Writing Now
            </Link>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 w-full sm:w-auto">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">4min</div>
              <div className="text-white/60 text-sm">Match Duration</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">5</div>
              <div className="text-white/60 text-sm">Writing Traits</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">6</div>
              <div className="text-white/60 text-sm">Mastery Levels</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚔️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Competitive Matches</h3>
            <p className="text-white/70 leading-relaxed">
              Join writing battles against real players and AI opponents. Earn points, climb ranks, and become a writing champion.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Feedback</h3>
            <p className="text-white/70 leading-relaxed">
              Get instant, personalized feedback from Claude AI. Learn what works and level up your writing traits.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🌳</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Character Evolution</h3>
            <p className="text-white/70 leading-relaxed">
              Watch your writer character grow from a tiny Seedling to a Legendary Redwood as you master writing skills.
            </p>
          </div>
        </div>

        {/* Character Showcase */}
        <div className="mt-32 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Your Writing Journey</h2>
          <p className="text-xl text-white/70 mb-12">Progress through 6 mastery levels</p>
          
          <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
            {[
              { emoji: '🌱', name: 'Seedling', level: 'Emerging' },
              { emoji: '🌿', name: 'Sapling', level: 'Developing' },
              { emoji: '🌳', name: 'Young Oak', level: 'Approaching' },
              { emoji: '🌲', name: 'Mature Oak', level: 'Proficient' },
              { emoji: '🌴', name: 'Ancient Oak', level: 'Advanced' },
              { emoji: '🏔️', name: 'Legendary Redwood', level: 'Expert' },
            ].map((stage, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200 w-40"
              >
                <div className="text-4xl mb-2">{stage.emoji}</div>
                <div className="text-white font-semibold mb-1">{stage.name}</div>
                <div className="text-white/60 text-sm">{stage.level}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 mt-32 border-t border-white/10">
        <div className="text-center text-white/60">
          <p>© 2025 Writing Arena. Transform writing through competition and AI feedback.</p>
        </div>
      </footer>
    </div>
  );
}

