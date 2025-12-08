/**
 * @fileoverview Sidebar showing annotated examples from grader config.
 * Displays positive/negative examples with explanations.
 */

'use client';

import { useState } from 'react';
import { PracticeLesson } from '@/lib/constants/practice-lessons';
import { getGraderConfig } from '@/lib/constants/grader-configs';

interface ExampleSidebarProps {
  lesson: PracticeLesson;
  collapsed?: boolean;
}

/**
 * @description Sidebar displaying annotated examples from grader config.
 */
export function ExampleSidebar({ lesson, collapsed = false }: ExampleSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const graderConfig = getGraderConfig(lesson.id);

  const positiveExamples = graderConfig.positiveExamples.slice(0, 2);
  const negativeExamples = graderConfig.negativeExamples.slice(0, 1);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-3 text-sm text-[rgba(255,255,255,0.6)] transition hover:bg-[rgba(255,255,255,0.04)]"
      >
        <span>📚</span>
        <span>Show examples</span>
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Reference Examples</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-xs text-[rgba(255,255,255,0.4)] hover:text-white"
        >
          Hide
        </button>
      </div>

      {/* Lesson Instructions */}
      <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
          How it works
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[rgba(255,255,255,0.6)]">
          {graderConfig.howTheActivityWorks}
        </p>
      </div>

      {/* Good Examples */}
      <div className="rounded-[10px] border border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.05)] p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-[#00d492]">
          <span>✅</span>
          <span>Good examples</span>
        </div>
        <div className="mt-3 space-y-3">
          {positiveExamples.map((ex, i) => (
            <div key={i} className="text-xs">
              <p className="italic text-[rgba(255,255,255,0.7)] whitespace-pre-line">&quot;{ex.example}&quot;</p>
              <p className="mt-1 text-[rgba(255,255,255,0.4)]">{ex.explainer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Common Mistakes */}
      {negativeExamples.length > 0 && (
        <div className="rounded-[10px] border border-[rgba(255,144,48,0.2)] bg-[rgba(255,144,48,0.05)] p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#ff9030]">
            <span>⚠️</span>
            <span>Avoid this</span>
          </div>
          <div className="mt-3 space-y-3">
            {negativeExamples.map((ex, i) => (
              <div key={i} className="text-xs">
                <p className="italic text-[rgba(255,255,255,0.7)] whitespace-pre-line">&quot;{ex.example}&quot;</p>
                <p className="mt-1 text-[rgba(255,255,255,0.4)]">{ex.explainer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Reference from exampleResponse */}
      {lesson.exampleResponse && (
        <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
            Quick reference
          </div>
          <p className="mt-2 text-xs text-[rgba(255,255,255,0.5)]">
            {lesson.exampleResponse.prompt}
          </p>
          <p className="mt-2 text-xs font-medium text-white">
            {lesson.exampleResponse.response}
          </p>
          <p className="mt-2 text-[10px] text-[#00e5e5]">
            {lesson.exampleResponse.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

