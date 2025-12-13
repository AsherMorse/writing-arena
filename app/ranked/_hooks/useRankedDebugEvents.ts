/**
 * @fileoverview Dev-only event wiring for ranked page UI state skipping.
 */

import { useEffect } from 'react';
import type { GradeResponse } from '@/app/_lib/grading';
import type { PromptOptions, RankedPrompt, SubmissionLevel } from '@/lib/types';
import type { RankedPhase } from '../_lib/ranked-phases';
import {
  createRankedDebugGradeResponse,
  createRankedDebugPrompt,
  createRankedDebugPromptOptions,
  createRankedDebugWritingContent,
  type RankedDebugPreset,
} from '../_lib/ranked-debug-fixtures';

type RankedJumpDetail = {
  phase: RankedPhase;
  preset?: RankedDebugPreset;
};

/**
 * @description Register dev-only debug events for quickly jumping between ranked UI phases.
 */
export function useRankedDebugEvents(args: {
  phase: RankedPhase;
  submissionMode: SubmissionLevel;
  currentPrompt: RankedPrompt | null;
  originalResponse: GradeResponse | null;
  response: GradeResponse | null;
  submitWriting: () => void;
  submitRevision: () => void;
  setPhase: (phase: RankedPhase) => void;
  setCurrentPrompt: (prompt: RankedPrompt | null) => void;
  setPromptOptions: (options: PromptOptions | null) => void;
  setPromptQuestion: (question: string | null) => void;
  setPromptHint: (hint: string | null) => void;
  setContent: (content: string) => void;
  setOriginalContent: (content: string) => void;
  setOriginalResponse: (response: GradeResponse | null) => void;
  setResponse: (response: GradeResponse | null) => void;
  setOpenPanel: (panel: 'hints' | 'fixes' | null) => void;
  setError: (error: string | null) => void;
  setSelectionError: (error: string | null) => void;
  setCustomInput: (value: string) => void;
  setIsLoadingSelection: (isLoading: boolean) => void;
  setShowResultsModal: (isOpen: boolean) => void;
  setShowCelebrationModal: (isOpen: boolean) => void;
}): void {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    function handleFillEditor(): void {
      args.setContent(
        'This is sample text filled by the debug menu for testing purposes. It contains enough content to submit and test the grading flow without having to type manually.'
      );
    }

    function handlePasteClipboard(event: Event): void {
      const customEvent = event as CustomEvent<string>;
      if (!customEvent.detail) return;
      args.setContent(customEvent.detail);
    }

    function handleForceSubmit(): void {
      if (args.phase === 'write') args.submitWriting();
      else if (args.phase === 'revise') args.submitRevision();
    }

    function handleSkipToResults(): void {
      if (args.originalResponse && args.response) args.setPhase('results');
    }

    function handleRankedJump(event: Event): void {
      const customEvent = event as CustomEvent<RankedJumpDetail>;
      const detail = customEvent.detail;
      if (!detail?.phase) return;

      const preset: RankedDebugPreset = detail.preset ?? 'short';
      const hasExistingPrompt = Boolean(args.currentPrompt);
      const rankedPrompt = hasExistingPrompt
        ? args.currentPrompt
        : createRankedDebugPrompt({ submissionMode: args.submissionMode, preset });

      // Shared resets so the UI is predictable.
      args.setError(null);
      args.setSelectionError(null);
      args.setIsLoadingSelection(false);
      args.setShowResultsModal(false);
      args.setShowCelebrationModal(false);
      args.setCustomInput('');

      if (!hasExistingPrompt) args.setCurrentPrompt(rankedPrompt);

      switch (detail.phase) {
        case 'prompt': {
          args.setPromptOptions(null);
          args.setOpenPanel(null);
          args.setPromptQuestion(null);
          args.setPromptHint(null);
          args.setOriginalResponse(null);
          args.setResponse(null);
          args.setOriginalContent('');
          args.setContent('');
          args.setPhase('prompt');
          return;
        }

        case 'selection': {
          args.setPromptOptions(createRankedDebugPromptOptions({ preset }));
          args.setOpenPanel(null);
          args.setPromptQuestion(null);
          args.setPromptHint(null);
          args.setOriginalResponse(null);
          args.setResponse(null);
          args.setOriginalContent('');
          args.setContent('');
          args.setPhase('selection');
          return;
        }

        case 'write': {
          args.setPromptOptions(null);
          args.setOpenPanel(null);
          args.setPromptQuestion('Why do libraries matter to a community?');
          args.setPromptHint('You might discuss access to information, quiet space, or community events.');
          args.setOriginalResponse(null);
          args.setResponse(null);
          args.setOriginalContent('');
          args.setContent(createRankedDebugWritingContent({ preset }));
          args.setPhase('write');
          return;
        }

        case 'feedback': {
          const gradeResponse = createRankedDebugGradeResponse({ preset });
          const originalContent = createRankedDebugWritingContent({ preset });
          args.setPromptOptions(null);
          args.setOpenPanel(null);
          args.setPromptQuestion('Why do libraries matter to a community?');
          args.setPromptHint('You might discuss access to information, quiet space, or community events.');
          args.setOriginalContent(originalContent);
          args.setContent(originalContent);
          args.setOriginalResponse(gradeResponse);
          args.setResponse(gradeResponse);
          args.setPhase('feedback');
          return;
        }

        case 'revise': {
          const gradeResponse = createRankedDebugGradeResponse({ preset });
          const originalContent = createRankedDebugWritingContent({ preset });
          args.setPromptOptions(null);
          args.setOpenPanel('fixes');
          args.setPromptQuestion('Why do libraries matter to a community?');
          args.setPromptHint('You might discuss access to information, quiet space, or community events.');
          args.setOriginalContent(originalContent);
          args.setContent(originalContent);
          args.setOriginalResponse(gradeResponse);
          // Keep `response` null here so results UI doesn’t appear accidentally.
          args.setResponse(null);
          args.setPhase('revise');
          return;
        }

        case 'results': {
          const gradeResponse = createRankedDebugGradeResponse({ preset });
          const originalContent = createRankedDebugWritingContent({ preset });
          args.setPromptOptions(null);
          args.setOpenPanel(null);
          args.setPromptQuestion('Why do libraries matter to a community?');
          args.setPromptHint('You might discuss access to information, quiet space, or community events.');
          args.setOriginalContent(originalContent);
          args.setContent(originalContent);
          args.setOriginalResponse(gradeResponse);
          args.setResponse(gradeResponse);
          args.setPhase('results');
          return;
        }

        case 'history':
        case 'no_prompt':
        case 'blocked':
        case 'loading': {
          // These phases are either data-driven or auth-driven; keep jump minimal.
          args.setPhase(detail.phase);
          return;
        }

        default: {
          // Exhaustiveness guard for future phases.
          args.setPhase('prompt');
        }
      }
    }

    window.addEventListener('debug-fill-editor', handleFillEditor);
    window.addEventListener('debug-paste-clipboard', handlePasteClipboard);
    window.addEventListener('debug-force-submit', handleForceSubmit);
    window.addEventListener('debug-skip-to-results', handleSkipToResults);
    window.addEventListener('debug-ranked-jump', handleRankedJump);

    return () => {
      window.removeEventListener('debug-fill-editor', handleFillEditor);
      window.removeEventListener('debug-paste-clipboard', handlePasteClipboard);
      window.removeEventListener('debug-force-submit', handleForceSubmit);
      window.removeEventListener('debug-skip-to-results', handleSkipToResults);
      window.removeEventListener('debug-ranked-jump', handleRankedJump);
    };
  }, [
    args,
  ]);
}



