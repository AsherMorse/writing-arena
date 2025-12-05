/**
 * @fileoverview Improve section landing page - choice between Chat and Activities.
 */

'use client';

import Link from 'next/link';
import Header from '@/components/shared/Header';
import { RequireAuth } from '@/components/auth/RequireAuth';

export default function ImprovePage() {
  return (
    <RequireAuth>
      <ImprovePageContent />
    </RequireAuth>
  );
}

/**
 * @description Landing page offering two paths for improvement: Chat and Activities.
 */
function ImprovePageContent() {
  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <Header />
      
      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] text-4xl">
            ✨
          </div>
          <h1 className="mb-3 text-3xl font-semibold">Improve Your Writing</h1>
          <p className="text-[rgba(255,255,255,0.5)]">
            Choose your path to becoming a better writer
          </p>
        </section>

        {/* Two Options */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Chat Option */}
          <Link
            href="/improve/chat"
            className="group relative overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8 transition hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.04)]"
          >
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.05)] bg-[#101012] text-3xl">
                💬
              </div>

              {/* Title */}
              <h2 className="mb-3 text-xl font-semibold">Chat with AI</h2>

              {/* Description */}
              <p className="mb-6 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
                Get personalized feedback on your past writing. Discuss your strengths, 
                work on weaknesses, and ask questions about improving specific skills.
              </p>

              {/* Features */}
              <ul className="mb-6 space-y-2 text-sm text-[rgba(255,255,255,0.6)]">
                <li className="flex items-start gap-2">
                  <span className="text-[#00e5e5]">✓</span>
                  <span>Analyze your completed essays</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00e5e5]">✓</span>
                  <span>Get personalized improvement advice</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00e5e5]">✓</span>
                  <span>Ask questions about writing techniques</span>
                </li>
              </ul>

              {/* CTA */}
              <div className="flex items-center gap-2 text-sm font-medium text-[#00e5e5]">
                <span>Open Chat</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>

            {/* Requirement Badge */}
            <div className="absolute right-4 top-4 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-1 text-xs text-[rgba(255,255,255,0.5)]">
              Requires 5 completed matches
            </div>
          </Link>

          {/* Activities Option */}
          <Link
            href="/improve/activities"
            className="group relative overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8 transition hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.04)]"
          >
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.05)] bg-[#101012] text-3xl">
                📚
              </div>

              {/* Title */}
              <h2 className="mb-3 text-xl font-semibold">Practice Activities</h2>

              {/* Description */}
              <p className="mb-6 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
                Master specific writing skills through focused lessons. 
                Complete short exercises, get instant feedback, and track your progress.
              </p>

              {/* Features */}
              <ul className="mb-6 space-y-2 text-sm text-[rgba(255,255,255,0.6)]">
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700]">★</span>
                  <span>Sentence, paragraph, and essay skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700]">★</span>
                  <span>Short, focused lessons (5-10 min)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700]">★</span>
                  <span>Earn LP and master skills</span>
                </li>
              </ul>

              {/* CTA */}
              <div className="flex items-center gap-2 text-sm font-medium text-[#FFD700]">
                <span>Browse Lessons</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>

            {/* Available Badge */}
            <div className="absolute right-4 top-4 rounded-full border border-[rgba(255,215,0,0.2)] bg-[rgba(255,215,0,0.1)] px-3 py-1 text-xs text-[#FFD700]">
              Available now
            </div>
          </Link>
        </div>

        {/* Help Text */}
        <section className="mt-12 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
          <div className="flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div className="text-sm">
              <p className="font-medium text-[rgba(255,255,255,0.7)]">Not sure which to choose?</p>
              <p className="mt-2 text-[rgba(255,255,255,0.5)]">
                <strong className="text-[rgba(255,255,255,0.6)]">Chat</strong> is great for discussing your overall writing patterns and getting personalized coaching.{' '}
                <strong className="text-[rgba(255,255,255,0.6)]">Activities</strong> are perfect for practicing and mastering specific techniques.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
