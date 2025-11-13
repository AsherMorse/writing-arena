'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import WritingTipsModal from '@/components/WritingTipsModal';

// Mock peer writings - in reality, these would come from other players
const MOCK_PEER_WRITINGS = [
  {
    id: 'peer1',
    author: 'ProWriter99',
    avatar: '🎯',
    rank: 'Silver II',
    content: `The old lighthouse stood sentinel on the rocky cliff, its weathered stones telling stories of countless storms. Sarah had passed it every day on her way to school, never giving it much thought. But today was different. Today, the rusty door that had always been locked stood slightly ajar, and a mysterious golden light spilled from within.

Her curiosity got the better of her. She pushed the door open and stepped inside. The circular room was dusty and filled with old equipment, but in the center sat an ornate wooden chest she'd never seen before. As she approached, the chest began to glow...`,
    wordCount: 112
  },
  {
    id: 'peer2',
    author: 'WordMaster',
    avatar: '📖',
    rank: 'Silver III',
    content: `It was a normal Tuesday morning. I woke up, got dressed, and went to school like always. Nothing interesting ever happens in my small town. But then something weird happened.

At lunch, I found a strange coin in my sandwich. It was old and had weird symbols on it. When I touched it, everything around me started to shimmer and change. Suddenly I wasn't in the cafeteria anymore.

I was standing in a forest I'd never seen before. There were trees everywhere and strange birds singing. I had no idea how I got there or how to get back home.`,
    wordCount: 104
  }
];

function RankedPeerFeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const promptId = searchParams.get('promptId');
  const promptType = searchParams.get('promptType');
  const content = searchParams.get('content') || '';
  const wordCount = searchParams.get('wordCount') || '0';
  const aiScores = searchParams.get('aiScores') || '';
  const yourScore = searchParams.get('yourScore') || '75';

  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes for peer feedback
  const [currentPeer] = useState(MOCK_PEER_WRITINGS[0]);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // Feedback questions and responses
  const [responses, setResponses] = useState({
    clarity: '',
    strengths: '',
    improvements: '',
    organization: '',
    engagement: ''
  });

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isFormComplete = () => {
    return Object.values(responses).every(response => response.trim().length > 30);
  };

  const handleChange = (key: keyof typeof responses, value: string) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch('/api/evaluate-peer-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses,
          peerWriting: currentPeer.content,
        }),
      });
      const data = await response.json();
      const feedbackScore = data.score || 75;
      router.push(
        `/ranked/phase-rankings?phase=2&trait=${trait}&promptId=${promptId}&promptType=${promptType}&content=${content}&wordCount=${wordCount}&aiScores=${aiScores}&yourScore=${yourScore}&feedbackScore=${Math.round(feedbackScore)}&peerFeedback=${encodeURIComponent(JSON.stringify(responses))}`
      );
    } catch (error) {
      const feedbackQuality = isFormComplete() ? Math.random() * 20 + 75 : Math.random() * 30 + 50;
      router.push(
        `/ranked/phase-rankings?phase=2&trait=${trait}&promptId=${promptId}&promptType=${promptType}&content=${content}&wordCount=${wordCount}&aiScores=${aiScores}&yourScore=${yourScore}&feedbackScore=${Math.round(feedbackQuality)}&peerFeedback=${encodeURIComponent(JSON.stringify(responses))}`
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const countdownColor = timeLeft > 120 ? 'text-emerald-200' : timeLeft > 60 ? 'text-yellow-300' : 'text-red-300';

  const questionConfig = [
    {
      key: 'clarity' as const,
      prompt: 'What is the main idea? Is the message clear?',
      placeholder: 'Explain what the writer is trying to convey and whether the purpose stays clear from start to finish...'
    },
    {
      key: 'strengths' as const,
      prompt: 'Highlight the strongest moments.',
      placeholder: 'Point to specific sentences or moves that you found effective and why they worked...'
    },
    {
      key: 'improvements' as const,
      prompt: 'Suggest the most important improvements.',
      placeholder: 'Offer concrete ideas for revision. Mention what to add, remove, or restructure...'
    },
    {
      key: 'organization' as const,
      prompt: 'Describe how well it is organized.',
      placeholder: 'Comment on transitions, paragraph focus, and logical flow from beginning to end...'
    },
    {
      key: 'engagement' as const,
      prompt: 'How engaging is the piece overall?',
      placeholder: 'Share how the writing made you feel and note any places where attention dipped...'
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <WritingTipsModal
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        promptType="informational"
      />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0c141d]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#141e27] text-xl font-semibold">
              {formatTime(timeLeft)}
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Phase 2 · Peer feedback</div>
              <p className={`text-sm font-semibold ${countdownColor}`}>Provide detailed, constructive insight.</p>
            </div>
            <div className="rounded-full border border-blue-200/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-200">
              Trait focus: {trait || 'all'}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => setShowTipsModal(true)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
            >
              Feedback tips
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormComplete() || isEvaluating}
              className={`rounded-full px-6 py-2 font-semibold transition ${
                isFormComplete() && !isEvaluating
                  ? 'bg-blue-400 text-[#0c141d] hover:bg-blue-300'
                  : 'bg-white/5 text-white/40 cursor-not-allowed'
              }`}
            >
              {isEvaluating ? 'Scoring...' : 'Submit feedback'}
            </button>
          </div>
        </div>
        <div className="mx-auto h-1.5 max-w-6xl rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${timeLeft > 120 ? 'bg-emerald-400' : timeLeft > 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
            style={{ width: `${(timeLeft / 180) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,1.2fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0c141d] text-2xl">
                  {currentPeer.avatar}
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">{currentPeer.author}</div>
                  <div className="text-sm text-white/50">{currentPeer.rank} · {currentPeer.wordCount} words</div>
                </div>
              </div>
              <div className="mt-5 space-y-4 text-xs text-white/60">
                <p>- Focus on clarity, organization, and engagement.</p>
                <p>- Mention specific lines to justify your comments.</p>
                <p>- Helpful, actionable advice earns higher LP.</p>
              </div>
            </div>
            <article className="rounded-3xl border border-white/10 bg-white p-7 text-[#1b1f24] shadow-lg">
              <header className="mb-4 flex items-center justify-between text-xs text-[#1b1f24]/60">
                <span>Peer draft</span>
                <span>{currentPeer.wordCount} words</span>
              </header>
              <div className="max-h-[540px] overflow-y-auto whitespace-pre-wrap text-base leading-relaxed">
                {currentPeer.content}
              </div>
            </article>
          </section>

          <section className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Feedback checklist</div>
                  <p className="mt-2 text-xs text-white/50">Respond to each prompt with at least 30 characters.</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
                  Autofinish when timer hits zero
                </div>
              </div>
            </div>
            {questionConfig.map(({ key, prompt, placeholder }) => (
              <div key={key} className="rounded-3xl border border-white/10 bg-[#141e27] p-6 text-sm">
                <label className="font-semibold text-white">{prompt}</label>
                <textarea
                  value={responses[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="mt-3 h-32 w-full resize-none rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-blue-300 focus:outline-none"
                />
                <div className={`mt-2 text-xs ${responses[key].length > 30 ? 'text-emerald-200' : 'text-white/40'}`}>
                  {responses[key].length} / 30 characters minimum
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function RankedPeerFeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0c141d] flex items-center justify-center text-white/60 text-sm">
        Loading peer feedback phase...
      </div>
    }>
      <RankedPeerFeedbackContent />
    </Suspense>
  );
}

