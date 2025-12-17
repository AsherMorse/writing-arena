/**
 * @fileoverview Tests for pre-validation (Layer 2 fast path).
 */

import { describe, it, expect } from 'vitest';
import { preValidateResponse, isLikelyGibberish } from './pre-validation';

describe('preValidateResponse', () => {
  describe('valid responses', () => {
    it('accepts a normal action sentence', () => {
      const result = preValidateResponse('I draw my sword and approach the dragon.');
      expect(result.valid).toBe(true);
    });

    it('accepts a minimum word count response', () => {
      const result = preValidateResponse('I attack now.');
      expect(result.valid).toBe(true);
    });

    it('accepts creative fantasy actions', () => {
      const result = preValidateResponse('I cast a magical spell of protection.');
      expect(result.valid).toBe(true);
    });

    it('accepts dialogue responses', () => {
      const result = preValidateResponse('I say to the merchant, "How much for that sword?"');
      expect(result.valid).toBe(true);
    });

    it('accepts responses with numbers', () => {
      const result = preValidateResponse('I pick up 3 gold coins from the floor.');
      expect(result.valid).toBe(true);
    });
  });

  describe('empty/whitespace input', () => {
    it('rejects empty string', () => {
      const result = preValidateResponse('');
      expect(result.valid).toBe(false);
      expect(result.category).toBe('GIBBERISH_INPUT');
      expect(result.reason).toBe('empty');
    });

    it('rejects whitespace only', () => {
      const result = preValidateResponse('   \t\n  ');
      expect(result.valid).toBe(false);
      expect(result.category).toBe('GIBBERISH_INPUT');
      expect(result.reason).toBe('empty');
    });

    it('rejects null-ish inputs', () => {
      const result = preValidateResponse(null as unknown as string);
      expect(result.valid).toBe(false);
    });
  });

  describe('too short responses', () => {
    it('rejects single word', () => {
      const result = preValidateResponse('attack');
      expect(result.valid).toBe(false);
      expect(result.category).toBe('TOO_SHORT');
      expect(result.reason).toContain('1 word');
    });

    it('rejects two words', () => {
      const result = preValidateResponse('attack now');
      expect(result.valid).toBe(false);
      expect(result.category).toBe('TOO_SHORT');
      expect(result.reason).toContain('2 words');
    });

    it('respects custom minWordCount', () => {
      // With minWordCount: 2, two words should be valid
      const result = preValidateResponse('attack now', { minWordCount: 2 });
      expect(result.valid).toBe(true);
    });

    it('accepts exactly at threshold', () => {
      const result = preValidateResponse('I attack now');
      expect(result.valid).toBe(true);
    });
  });

  describe('keyboard mashing detection', () => {
    it('rejects repeated characters', () => {
      const result = preValidateResponse('asdfghjkl');
      expect(result.valid).toBe(false);
      expect(result.category).toBe('GIBBERISH_INPUT');
    });

    it('rejects "aaaaaaaa"', () => {
      const result = preValidateResponse('aaaaaaaa');
      expect(result.valid).toBe(false);
      expect(result.category).toBe('GIBBERISH_INPUT');
    });

    it('rejects "qwerty" patterns', () => {
      const result = preValidateResponse('qwerty');
      expect(result.valid).toBe(false);
      expect(result.category).toBe('GIBBERISH_INPUT');
    });

    it('rejects "asdfgh" patterns', () => {
      const result = preValidateResponse('asdfgh');
      expect(result.valid).toBe(false);
      expect(result.category).toBe('GIBBERISH_INPUT');
    });

    it('rejects text with 5+ repeated consecutive chars', () => {
      const result = preValidateResponse('I saaaaay hello');
      expect(result.valid).toBe(false);
      expect(result.category).toBe('GIBBERISH_INPUT');
      expect(result.reason).toBe('repeated characters');
    });

    it('allows 4 repeated chars (edge case)', () => {
      const result = preValidateResponse('I saaay hello friend');
      expect(result.valid).toBe(true);
    });
  });

  describe('no vowels detection', () => {
    it('rejects consonant-only gibberish', () => {
      const result = preValidateResponse('bcdfgh jklmnp');
      expect(result.valid).toBe(false);
      expect(result.category).toBe('GIBBERISH_INPUT');
      expect(result.reason).toBe('no vowels');
    });

    it('accepts text with vowels', () => {
      const result = preValidateResponse('I attack the dragon.');
      expect(result.valid).toBe(true);
    });

    it('ignores short no-vowel strings (abbreviations)', () => {
      // "xyz" is short enough to be an abbreviation
      const result = preValidateResponse('xyz is my name');
      expect(result.valid).toBe(true);
    });
  });

  describe('punctuation-only detection', () => {
    it('rejects only punctuation', () => {
      const result = preValidateResponse('!!!???...');
      expect(result.valid).toBe(false);
      expect(result.category).toBe('GIBBERISH_INPUT');
    });

    it('rejects special characters only', () => {
      const result = preValidateResponse('@#$%^&*()');
      expect(result.valid).toBe(false);
      expect(result.category).toBe('GIBBERISH_INPUT');
    });
  });

  describe('duplicate detection', () => {
    it('rejects exact duplicate of previous response', () => {
      const result = preValidateResponse('I attack the dragon', {
        previousResponses: ['I attack the dragon'],
      });
      expect(result.valid).toBe(false);
      expect(result.category).toBe('GIBBERISH_INPUT');
      expect(result.reason).toBe('duplicate response');
    });

    it('rejects case-insensitive duplicate', () => {
      const result = preValidateResponse('I ATTACK THE DRAGON', {
        previousResponses: ['i attack the dragon'],
      });
      expect(result.valid).toBe(false);
      expect(result.category).toBe('GIBBERISH_INPUT');
    });

    it('rejects duplicate ignoring punctuation', () => {
      const result = preValidateResponse('I attack the dragon!!!', {
        previousResponses: ['I attack the dragon.'],
      });
      expect(result.valid).toBe(false);
      expect(result.category).toBe('GIBBERISH_INPUT');
    });

    it('accepts similar but different response', () => {
      const result = preValidateResponse('I attack the goblin', {
        previousResponses: ['I attack the dragon'],
      });
      expect(result.valid).toBe(true);
    });

    it('accepts when no previous responses', () => {
      const result = preValidateResponse('I attack the dragon', {
        previousResponses: [],
      });
      expect(result.valid).toBe(true);
    });
  });
});

describe('isLikelyGibberish', () => {
  it('returns true for gibberish', () => {
    // Note: isLikelyGibberish uses minWordCount: 1, so single-word gibberish must be caught
    // by gibberish-specific checks, not word count
    expect(isLikelyGibberish('asdfghjkl')).toBe(true); // keyboard pattern
    expect(isLikelyGibberish('aaaaaaaaa')).toBe(true); // repeated character
    expect(isLikelyGibberish('!!???..')).toBe(true); // no letters
  });

  it('returns false for valid text', () => {
    expect(isLikelyGibberish('attack')).toBe(false); // single valid word
    expect(isLikelyGibberish('Hello')).toBe(false);  // single valid word
  });

  it('returns true for empty/whitespace', () => {
    expect(isLikelyGibberish('')).toBe(true);
    expect(isLikelyGibberish('   ')).toBe(true);
  });
});

