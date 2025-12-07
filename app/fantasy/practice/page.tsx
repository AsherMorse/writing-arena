'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ModeCardProps {
  title: string;
  description: string;
  details: string[];
  href: string;
}

function ModeCard({ title, description, details, href }: ModeCardProps) {
  return (
    <Link
      href={href}
      className="flex-1 rounded-lg p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: 'rgba(26, 18, 8, 0.9)',
        border: '1px solid rgba(201, 168, 76, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <h2
        className="font-dutch809 text-2xl mb-2"
        style={{ color: '#f6d493' }}
      >
        {title}
      </h2>
      <p
        className="font-avenir text-base mb-4"
        style={{ color: 'rgba(245, 230, 184, 0.8)' }}
      >
        {description}
      </p>
      <ul className="space-y-1">
        {details.map((detail, i) => (
          <li
            key={i}
            className="font-avenir text-sm flex items-center gap-2"
            style={{ color: 'rgba(245, 230, 184, 0.6)' }}
          >
            <span style={{ color: '#c9a84c' }}>✦</span>
            {detail}
          </li>
        ))}
      </ul>
    </Link>
  );
}

export default function PracticePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen">
      <Image
        src="/images/backgrounds/bg.webp"
        alt=""
        fill
        className="object-cover"
        priority
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="flex items-center justify-between p-4">
          <button
            onClick={() => router.push('/fantasy')}
            className="font-memento text-sm uppercase tracking-wider"
            style={{ color: 'rgba(245, 230, 184, 0.6)' }}
          >
            ← Back
          </button>
          <div className="w-16" />
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <div className="text-center mb-10">
              <h1
                className="font-dutch809 text-4xl mb-2"
                style={{
                  color: '#f6d493',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                }}
              >
                Choose Your Challenge
              </h1>
              <p
                className="font-avenir text-lg"
                style={{ color: 'rgba(245, 230, 184, 0.7)' }}
              >
                Select a writing mode to begin
              </p>
            </div>

            <div className="flex gap-6">
              <ModeCard
                title="Paragraph"
                description="Write a focused single paragraph with a clear topic sentence, supporting details, and conclusion."
                details={[
                  '7 minutes to write',
                  '2 minutes to revise',
                ]}
                href="/fantasy/practice/paragraph"
              />
              <ModeCard
                title="Essay"
                description="Compose a multi-paragraph essay with a thesis, body paragraphs, and conclusion."
                details={[
                  '10 minutes to write',
                  '3 minutes to revise',
                  '4+ paragraphs',
                ]}
                href="/fantasy/practice/essay"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
