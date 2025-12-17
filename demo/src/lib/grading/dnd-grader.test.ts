/**
 * @fileoverview Integration tests for the 3-layer D&D Grader.
 * Tests the full gradeDnDTurn function with mocked LLM responses.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DnDGraderInput, NarrativeContext } from './dnd-grader-types';

// =============================================================================
// TEST HELPERS
// =============================================================================

const DEFAULT_CONTEXT: NarrativeContext = {
  currentLocation: "Dragon's Lair",
  sceneDescription: 'A massive red dragon blocks the cave exit. Its scales glimmer in the torchlight.',
  characterClass: 'Warrior',
  characterAbilities: ['sword fighting', 'shield block', 'battle cry'],
  inventoryItems: ['iron sword', 'wooden shield', 'healing potion'],
  currentObjective: 'Escape the cave',
};

const DEFAULT_INPUT: DnDGraderInput = {
  studentResponse: 'I draw my sword and carefully approach the dragon.',
  gradeLevel: 6,
  categoryPreset: 'fantasy',
  gameContext: DEFAULT_CONTEXT,
};

function createMockLLMResponse(layer1Errors: unknown[], layer2Valid: boolean, layer2Error: unknown, layer3Errors: unknown[]) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({
          layer1: { errors: layer1Errors },
          layer2: { valid: layer2Valid, error: layer2Error },
          layer3: { errors: layer3Errors },
        }),
      },
    ],
  };
}

// Create a mock function that will be hoisted
const mockCreate = vi.hoisted(() => vi.fn());

// Mock the entire module
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  })),
}));

// Import after mocking
import { gradeDnDTurn } from './dnd-grader';

// =============================================================================
// TESTS
// =============================================================================

describe('gradeDnDTurn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('pre-validation blocking', () => {
    it('blocks empty input without calling LLM', async () => {
      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: '',
      });

      expect(result.accepted).toBe(false);
      expect(result.blockingReason).toContain('write something');
      expect(result.evaluationMethod).toBe('prevalidation');
      expect(result.hpDamage).toBe(0);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('blocks too-short input without calling LLM', async () => {
      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: 'attack',
      });

      expect(result.accepted).toBe(false);
      expect(result.blockingReason).toContain('too short');
      expect(result.evaluationMethod).toBe('prevalidation');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('blocks gibberish input without calling LLM', async () => {
      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: 'asdfghjkl',
      });

      expect(result.accepted).toBe(false);
      expect(result.layer2Errors[0]?.category).toBe('GIBBERISH_INPUT');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('blocks keyboard mashing', async () => {
      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: 'qwerty',
      });

      expect(result.accepted).toBe(false);
      expect(result.layer2Errors[0]?.category).toBe('GIBBERISH_INPUT');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('blocks duplicate responses', async () => {
      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: 'I attack the dragon fiercely',
        previousResponses: ['I attack the dragon fiercely'],
      });

      expect(result.accepted).toBe(false);
      expect(result.blockingReason).toContain('already tried');
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('clean responses', () => {
    it('accepts a perfect response with no errors', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse([], true, null, [])
      );

      const result = await gradeDnDTurn(DEFAULT_INPUT);

      expect(result.accepted).toBe(true);
      expect(result.hpDamage).toBe(0);
      expect(result.hasErrors).toBe(false);
      expect(result.score).toBe(100);
      expect(result.feedbackSummary).toContain('Perfect');
    });
  });

  describe('Layer 1: Grammar errors', () => {
    it('accepts response with grammar errors and calculates HP damage', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [
            {
              category: 'SENTENCE_FRAGMENT',
              explanation: 'This is an incomplete sentence.',
              substring: 'Because dragons.',
              fix: 'Because there are dragons nearby.',
            },
          ],
          true,
          null,
          []
        )
      );

      const result = await gradeDnDTurn(DEFAULT_INPUT);

      expect(result.accepted).toBe(true);
      expect(result.hpDamage).toBe(-4); // Critical error = -4
      expect(result.layer1Errors).toHaveLength(1);
      expect(result.layer1Errors[0].category).toBe('SENTENCE_FRAGMENT');
      expect(result.score).toBe(60); // 100 - (4 * 10)
    });

    it('calculates cumulative HP damage for multiple errors', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [
            { category: 'TYPOS', explanation: 'Spelling error.', substring: 'swrod', fix: 'sword' },
            { category: 'TYPOS', explanation: 'Another spelling error.', substring: 'aproach', fix: 'approach' },
            { category: 'CAPITALIZATION_ERROR', explanation: 'Capitalize I.', substring: 'i', fix: 'I' },
          ],
          true,
          null,
          []
        )
      );

      const result = await gradeDnDTurn(DEFAULT_INPUT);

      expect(result.accepted).toBe(true);
      // TYPOS = -1 each, CAPITALIZATION = -2
      expect(result.hpDamage).toBe(-4); // -1 + -1 + -2
      expect(result.layer1Errors).toHaveLength(3);
    });

    it('caps HP damage at -10', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [
            { category: 'SENTENCE_FRAGMENT', explanation: 'test', substring: 'test' }, // -4
            { category: 'RUN_ON_SENTENCE', explanation: 'test', substring: 'test' }, // -4
            { category: 'COMMA_SPLICE', explanation: 'test', substring: 'test' }, // -4
          ],
          true,
          null,
          []
        )
      );

      const result = await gradeDnDTurn(DEFAULT_INPUT);

      expect(result.accepted).toBe(true);
      expect(result.hpDamage).toBe(-10); // Capped, not -12
      expect(result.score).toBe(0); // 100 - (10 * 10)
    });

    it('prioritizes errors by severity', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [
            { category: 'TYPOS', explanation: 'minor error', substring: 'test' }, // minor
            { category: 'SENTENCE_FRAGMENT', explanation: 'critical error', substring: 'test' }, // critical
            { category: 'CAPITALIZATION_ERROR', explanation: 'major error', substring: 'test' }, // major
          ],
          true,
          null,
          []
        )
      );

      const result = await gradeDnDTurn(DEFAULT_INPUT);

      // Critical should be first in prioritized errors
      expect(result.prioritizedErrors[0].category).toBe('SENTENCE_FRAGMENT');
    });
  });

  describe('Layer 2: Quest requirement blocking', () => {
    it('blocks NOT_A_PLAYER_ACTION', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [],
          false,
          {
            category: 'NOT_A_PLAYER_ACTION',
            explanation: 'This describes what an NPC does, not your character.',
          },
          []
        )
      );

      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: 'The dragon flies away into the sunset and disappears.',
      });

      expect(result.accepted).toBe(false);
      expect(result.hpDamage).toBe(0);
      expect(result.blockingReason).toContain('NPC');
      expect(result.layer2Errors).toHaveLength(1);
      expect(result.layer2Errors[0].category).toBe('NOT_A_PLAYER_ACTION');
    });

    it('blocks OFF_TOPIC responses', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [],
          false,
          {
            category: 'OFF_TOPIC',
            explanation: "Let's stay focused on the adventure!",
          },
          []
        )
      );

      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: "What's for lunch today? I'm really hungry right now.",
      });

      expect(result.accepted).toBe(false);
      expect(result.layer2Errors[0].category).toBe('OFF_TOPIC');
    });

    it('blocks INAPPROPRIATE_CONTENT', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [],
          false,
          {
            category: 'INAPPROPRIATE_CONTENT',
            explanation: "That action isn't appropriate for this adventure.",
          },
          []
        )
      );

      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: 'I do something very inappropriate here in this game.',
      });

      expect(result.accepted).toBe(false);
      expect(result.layer2Errors[0].category).toBe('INAPPROPRIATE_CONTENT');
    });
  });

  describe('Layer 3: Narrative appropriateness', () => {
    it('blocks ANACHRONISM (modern technology)', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [],
          true,
          null,
          [
            {
              category: 'ANACHRONISM',
              explanation: "Phones don't exist in this medieval fantasy world.",
              suggestion: 'Try calling out to nearby allies or using a signal horn.',
            },
          ]
        )
      );

      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: 'I pull out my phone and call for backup immediately.',
      });

      expect(result.accepted).toBe(false);
      expect(result.hpDamage).toBe(0);
      expect(result.blockingReason).toContain("don't exist");
      expect(result.blockingReason).toContain('Try:'); // Should include suggestion
      expect(result.layer3Errors[0].category).toBe('ANACHRONISM');
    });

    it('blocks IMPOSSIBLE_ACTION', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [],
          true,
          null,
          [
            {
              category: 'IMPOSSIBLE_ACTION',
              explanation: 'You cannot fly without magical abilities.',
              suggestion: 'Try climbing or finding another way up.',
            },
          ]
        )
      );

      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: 'I fly up to the ceiling of the cave easily.',
      });

      expect(result.accepted).toBe(false);
      expect(result.layer3Errors[0].category).toBe('IMPOSSIBLE_ACTION');
    });

    it('blocks PHYSICS_BREAK', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [],
          true,
          null,
          [
            {
              category: 'PHYSICS_BREAK',
              explanation: 'You cannot walk through solid stone walls.',
            },
          ]
        )
      );

      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: 'I walk through the wall to escape the dragon.',
      });

      expect(result.accepted).toBe(false);
      expect(result.layer3Errors[0].category).toBe('PHYSICS_BREAK');
    });

    it('accepts OUT_OF_CHARACTER with warning (HP penalty)', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [],
          true,
          null,
          [
            {
              category: 'OUT_OF_CHARACTER',
              explanation: "As a Warrior, you don't have spell-casting abilities.",
            },
          ]
        )
      );

      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: 'I cast a fireball spell at the dragon now.',
      });

      expect(result.accepted).toBe(true); // Warning, not blocking
      expect(result.hpDamage).toBe(-2); // OUT_OF_CHARACTER = -2 HP
      expect(result.layer3Errors[0].severity).toBe('warning');
    });

    it('accepts META_GAMING with warning (HP penalty)', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [],
          true,
          null,
          [
            {
              category: 'META_GAMING',
              explanation: "Describe what your character does, not game mechanics.",
            },
          ]
        )
      );

      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: 'I roll a 20 on my attack roll now.',
      });

      expect(result.accepted).toBe(true);
      expect(result.hpDamage).toBe(-1); // META_GAMING = -1 HP
      expect(result.layer3Errors[0].severity).toBe('warning');
    });
  });

  describe('combined layer errors', () => {
    it('combines HP damage from Layer 1 and Layer 3 warnings', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [
            { category: 'TYPOS', explanation: 'Spelling error', substring: 'swrod', fix: 'sword' },
          ],
          true,
          null,
          [
            { category: 'META_GAMING', explanation: 'Stay in character' },
          ]
        )
      );

      const result = await gradeDnDTurn(DEFAULT_INPUT);

      expect(result.accepted).toBe(true);
      // TYPOS (-1) + META_GAMING (-1) = -2
      expect(result.hpDamage).toBe(-2);
      expect(result.layer1Errors).toHaveLength(1);
      expect(result.layer3Errors).toHaveLength(1);
    });

    it('Layer 2 blocking takes precedence over grammar errors', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [
            { category: 'TYPOS', explanation: 'Error found', substring: 'test' },
          ],
          false,
          { category: 'NOT_A_PLAYER_ACTION', explanation: 'Invalid action' },
          []
        )
      );

      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: 'The dragon flies away and the quest is complete.',
      });

      expect(result.accepted).toBe(false);
      expect(result.hpDamage).toBe(0); // Blocked = no HP damage
      // Grammar errors are still captured for potential future use
      expect(result.layer1Errors).toHaveLength(1);
    });

    it('Layer 3 blocking takes precedence over Layer 1 errors', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [
            { category: 'SENTENCE_FRAGMENT', explanation: 'Fragment', substring: 'test' },
          ],
          true,
          null,
          [
            { category: 'ANACHRONISM', explanation: 'No phones', suggestion: 'Use a horn' },
          ]
        )
      );

      const result = await gradeDnDTurn({
        ...DEFAULT_INPUT,
        studentResponse: 'I pull out my phone and call someone.',
      });

      expect(result.accepted).toBe(false);
      expect(result.hpDamage).toBe(0);
      expect(result.blockingReason).toContain('No phones');
    });
  });

  describe('error handling', () => {
    it('fails open on LLM error (accepts with no damage)', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API error'));

      const result = await gradeDnDTurn(DEFAULT_INPUT);

      expect(result.accepted).toBe(true);
      expect(result.hpDamage).toBe(0);
      expect(result.hasErrors).toBe(false);
    });

    it('handles non-text response from LLM', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'image', source: {} }],
      });

      const result = await gradeDnDTurn(DEFAULT_INPUT);

      expect(result.accepted).toBe(true);
      expect(result.hpDamage).toBe(0);
    });
  });

  describe('backward compatibility', () => {
    it('includes score field (0-100)', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [{ category: 'TYPOS', explanation: 'test', substring: 'test' }],
          true,
          null,
          []
        )
      );

      const result = await gradeDnDTurn(DEFAULT_INPUT);

      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('includes feedback array', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse([], true, null, [])
      );

      const result = await gradeDnDTurn(DEFAULT_INPUT);

      expect(Array.isArray(result.feedback)).toBe(true);
    });

    it('includes hasErrors and errorCount', async () => {
      mockCreate.mockResolvedValueOnce(
        createMockLLMResponse(
          [{ category: 'TYPOS', explanation: 'test', substring: 'test' }],
          true,
          null,
          []
        )
      );

      const result = await gradeDnDTurn(DEFAULT_INPUT);

      expect(result.hasErrors).toBe(true);
      expect(result.errorCount).toBe(1);
    });
  });
});
