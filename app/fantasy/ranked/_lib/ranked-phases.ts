/**
 * @fileoverview Shared type definitions for ranked match UI phases.
 */

/**
 * @description Discrete UI phases used by the Ranked page state machine.
 */
export type RankedPhase =
  | 'loading'
  | 'prompt'
  | 'selection'
  | 'write'
  | 'feedback'
  | 'revise'
  | 'results'
  | 'no_prompt'
  | 'blocked'
  | 'history';

