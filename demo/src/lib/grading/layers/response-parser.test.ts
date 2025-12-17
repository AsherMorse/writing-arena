/**
 * @fileoverview Tests for combined LLM response parser.
 */

import { describe, it, expect } from 'vitest';
import { parseCombinedResponse, isNoErrorsResponse } from './response-parser';

describe('parseCombinedResponse', () => {
  describe('valid JSON parsing', () => {
    it('parses a complete response with all layers', () => {
      const json = JSON.stringify({
        layer1: {
          errors: [
            {
              category: 'TYPOS',
              explanation: 'You spelled "sword" incorrectly.',
              substring: 'swrod',
              fix: 'sword',
            },
          ],
        },
        layer2: {
          valid: true,
          error: null,
        },
        layer3: {
          errors: [],
        },
      });

      const result = parseCombinedResponse(json);

      expect(result.layer1Errors).toHaveLength(1);
      expect(result.layer1Errors[0].category).toBe('TYPOS');
      expect(result.layer1Errors[0].explanation).toBe('You spelled "sword" incorrectly.');
      expect(result.layer1Errors[0].substringOfInterest).toBe('swrod');
      expect(result.layer1Errors[0].potentialFix).toBe('sword');
      expect(result.layer1Errors[0].severity).toBe('minor');
      expect(result.layer1Errors[0].hpDamage).toBe(-1);

      expect(result.layer2Error).toBeNull();
      expect(result.layer3Errors).toHaveLength(0);
    });

    it('parses Layer 2 blocking error', () => {
      const json = JSON.stringify({
        layer1: { errors: [] },
        layer2: {
          valid: false,
          error: {
            category: 'NOT_A_PLAYER_ACTION',
            explanation: 'This describes what an NPC does, not your character.',
          },
        },
        layer3: { errors: [] },
      });

      const result = parseCombinedResponse(json);

      expect(result.layer2Error).not.toBeNull();
      expect(result.layer2Error?.category).toBe('NOT_A_PLAYER_ACTION');
      expect(result.layer2Error?.severity).toBe('blocking');
      expect(result.layer2Error?.hpDamage).toBe(0);
    });

    it('parses Layer 3 blocking error', () => {
      const json = JSON.stringify({
        layer1: { errors: [] },
        layer2: { valid: true, error: null },
        layer3: {
          errors: [
            {
              category: 'ANACHRONISM',
              explanation: "Phones don't exist in this world.",
              suggestion: 'Try using a messenger pigeon instead.',
            },
          ],
        },
      });

      const result = parseCombinedResponse(json);

      expect(result.layer3Errors).toHaveLength(1);
      expect(result.layer3Errors[0].category).toBe('ANACHRONISM');
      expect(result.layer3Errors[0].severity).toBe('blocking');
      expect(result.layer3Errors[0].hpDamage).toBe(0);
      expect(result.layer3Errors[0].suggestedAlternative).toBe(
        'Try using a messenger pigeon instead.'
      );
    });

    it('parses Layer 3 warning error', () => {
      const json = JSON.stringify({
        layer1: { errors: [] },
        layer2: { valid: true, error: null },
        layer3: {
          errors: [
            {
              category: 'META_GAMING',
              explanation: 'Stay in character - describe actions, not game mechanics.',
            },
          ],
        },
      });

      const result = parseCombinedResponse(json);

      expect(result.layer3Errors).toHaveLength(1);
      expect(result.layer3Errors[0].category).toBe('META_GAMING');
      expect(result.layer3Errors[0].severity).toBe('warning');
      expect(result.layer3Errors[0].hpDamage).toBe(-1);
    });

    it('parses multiple Layer 1 errors', () => {
      const json = JSON.stringify({
        layer1: {
          errors: [
            { category: 'SENTENCE_FRAGMENT', explanation: 'Incomplete sentence.', substring: 'Because dragons.', fix: 'Because there are dragons.' },
            { category: 'TYPOS', explanation: 'Spelling error.', substring: 'swrod', fix: 'sword' },
            { category: 'CAPITALIZATION_ERROR', explanation: 'Capitalize this.', substring: 'i', fix: 'I' },
          ],
        },
        layer2: { valid: true, error: null },
        layer3: { errors: [] },
      });

      const result = parseCombinedResponse(json);

      expect(result.layer1Errors).toHaveLength(3);
      expect(result.layer1Errors[0].severity).toBe('critical'); // SENTENCE_FRAGMENT
      expect(result.layer1Errors[1].severity).toBe('minor'); // TYPOS
      expect(result.layer1Errors[2].severity).toBe('major'); // CAPITALIZATION_ERROR
    });
  });

  describe('markdown code block handling', () => {
    it('extracts JSON from markdown code block', () => {
      const response = `Here is my analysis:

\`\`\`json
{
  "layer1": { "errors": [] },
  "layer2": { "valid": true, "error": null },
  "layer3": { "errors": [] }
}
\`\`\``;

      const result = parseCombinedResponse(response);

      expect(result.layer1Errors).toHaveLength(0);
      expect(result.layer2Error).toBeNull();
      expect(result.layer3Errors).toHaveLength(0);
    });

    it('extracts JSON from code block without language tag', () => {
      const response = `\`\`\`
{
  "layer1": { "errors": [] },
  "layer2": { "valid": true, "error": null },
  "layer3": { "errors": [] }
}
\`\`\``;

      const result = parseCombinedResponse(response);
      expect(result.layer2Error).toBeNull();
    });
  });

  describe('error handling', () => {
    it('returns empty result for empty string', () => {
      const result = parseCombinedResponse('');

      expect(result.layer1Errors).toHaveLength(0);
      expect(result.layer2Error).toBeNull();
      expect(result.layer3Errors).toHaveLength(0);
    });

    it('returns empty result for invalid JSON', () => {
      const result = parseCombinedResponse('not valid json');

      expect(result.layer1Errors).toHaveLength(0);
      expect(result.layer2Error).toBeNull();
      expect(result.layer3Errors).toHaveLength(0);
    });

    it('returns empty result for missing layer1', () => {
      const json = JSON.stringify({
        layer2: { valid: true, error: null },
        layer3: { errors: [] },
      });

      const result = parseCombinedResponse(json);
      expect(result.layer1Errors).toHaveLength(0);
    });

    it('filters out Layer 1 errors with missing fields', () => {
      const json = JSON.stringify({
        layer1: {
          errors: [
            { category: 'TYPOS' }, // Missing explanation and substring
            { category: 'TYPOS', explanation: 'test', substring: 'test' }, // Valid
          ],
        },
        layer2: { valid: true, error: null },
        layer3: { errors: [] },
      });

      const result = parseCombinedResponse(json);
      expect(result.layer1Errors).toHaveLength(1);
    });

    it('ignores invalid Layer 2 categories', () => {
      const json = JSON.stringify({
        layer1: { errors: [] },
        layer2: {
          valid: false,
          error: {
            category: 'INVALID_CATEGORY',
            explanation: 'test',
          },
        },
        layer3: { errors: [] },
      });

      const result = parseCombinedResponse(json);
      expect(result.layer2Error).toBeNull();
    });

    it('filters out invalid Layer 3 categories', () => {
      const json = JSON.stringify({
        layer1: { errors: [] },
        layer2: { valid: true, error: null },
        layer3: {
          errors: [
            { category: 'INVALID_CATEGORY', explanation: 'test' },
            { category: 'ANACHRONISM', explanation: 'Valid error' },
          ],
        },
      });

      const result = parseCombinedResponse(json);
      expect(result.layer3Errors).toHaveLength(1);
      expect(result.layer3Errors[0].category).toBe('ANACHRONISM');
    });
  });

  describe('severity and HP damage assignment', () => {
    it('assigns correct severity to Layer 1 critical errors', () => {
      const json = JSON.stringify({
        layer1: {
          errors: [
            { category: 'SENTENCE_FRAGMENT', explanation: 'test', substring: 'test' },
            { category: 'RUN_ON_SENTENCE', explanation: 'test', substring: 'test' },
            { category: 'COMMA_SPLICE', explanation: 'test', substring: 'test' },
          ],
        },
        layer2: { valid: true, error: null },
        layer3: { errors: [] },
      });

      const result = parseCombinedResponse(json);

      expect(result.layer1Errors[0].severity).toBe('critical');
      expect(result.layer1Errors[0].hpDamage).toBe(-4);
      expect(result.layer1Errors[1].severity).toBe('critical');
      expect(result.layer1Errors[2].severity).toBe('critical');
    });

    it('assigns correct HP damage to Layer 3 categories', () => {
      const json = JSON.stringify({
        layer1: { errors: [] },
        layer2: { valid: true, error: null },
        layer3: {
          errors: [
            { category: 'OUT_OF_CHARACTER', explanation: 'test' },
            { category: 'META_GAMING', explanation: 'test' },
          ],
        },
      });

      const result = parseCombinedResponse(json);

      expect(result.layer3Errors[0].hpDamage).toBe(-2); // OUT_OF_CHARACTER
      expect(result.layer3Errors[1].hpDamage).toBe(-1); // META_GAMING
    });
  });
});

describe('isNoErrorsResponse', () => {
  it('detects "No errors" text', () => {
    expect(isNoErrorsResponse('No errors')).toBe(true);
    expect(isNoErrorsResponse('NO ERRORS')).toBe(true);
    expect(isNoErrorsResponse('no errors')).toBe(true);
  });

  it('detects "No errors found"', () => {
    expect(isNoErrorsResponse('No errors found')).toBe(true);
  });

  it('detects empty errors arrays in JSON', () => {
    expect(isNoErrorsResponse('{"layer1": {"errors": []}}')).toBe(true);
  });

  it('detects grammar-specific no errors', () => {
    expect(isNoErrorsResponse('No grammar errors found.')).toBe(true);
    expect(isNoErrorsResponse('No spelling errors')).toBe(true);
    expect(isNoErrorsResponse('No writing errors detected')).toBe(true);
  });

  it('returns false for responses with errors', () => {
    expect(isNoErrorsResponse('Found 1 error')).toBe(false);
    expect(isNoErrorsResponse('TYPOS: misspelled word')).toBe(false);
  });
});

