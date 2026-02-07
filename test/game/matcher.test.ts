import { describe, it, expect } from 'vitest';
import { findMatch } from '../../src/game/matcher';

describe('findMatch', () => {
  const testData = {
    goblin: {
      name: 'Goblin',
      value: 'test'
    },
    dire_wolf: {
      name: 'Dire Wolf',
      value: 'test'
    },
    ancient_ruins: {
      name: 'The Ancient Ruins of Xylos',
      value: 'test'
    }
  };

  describe('exact matching', () => {
    it('matches exact name case-insensitive', () => {
      const result = findMatch('goblin', testData);
      expect(result).toEqual(['goblin', testData.goblin]);
    });

    it('matches exact name with different case', () => {
      const result = findMatch('GOBLIN', testData);
      expect(result).toEqual(['goblin', testData.goblin]);
    });

    it('matches exact key case-insensitive', () => {
      const result = findMatch('dire wolf', testData);
      expect(result).toEqual(['dire_wolf', testData.dire_wolf]);
    });

    it('matches key with underscores replaced by spaces', () => {
      const result = findMatch('dire_wolf', testData);
      expect(result).toEqual(['dire_wolf', testData.dire_wolf]);
    });
  });

  describe('partial substring matching', () => {
    it('matches partial substring in name', () => {
      const result = findMatch('wolf', testData);
      expect(result).toEqual(['dire_wolf', testData.dire_wolf]);
    });

    it('matches partial substring in key', () => {
      const result = findMatch('gob', testData);
      expect(result).toEqual(['goblin', testData.goblin]);
    });

    it('matches case-insensitive partial', () => {
      const result = findMatch('ANCIENT', testData);
      expect(result).toEqual(['ancient_ruins', testData.ancient_ruins]);
    });
  });

  describe('word-based fuzzy matching', () => {
    it('matches all words present in different order', () => {
      const result = findMatch('ruins ancient', testData);
      expect(result).toEqual(['ancient_ruins', testData.ancient_ruins]);
    });

    it('matches when all input words are in target', () => {
      const result = findMatch('ancient xylos', testData);
      expect(result).toEqual(['ancient_ruins', testData.ancient_ruins]);
    });

    it('matches partial words in name', () => {
      const result = findMatch('the ruins', testData);
      expect(result).toEqual(['ancient_ruins', testData.ancient_ruins]);
    });
  });

  describe('no match scenarios', () => {
    it('returns null for no match', () => {
      const result = findMatch('dragon', testData);
      expect(result).toEqual([null, null]);
    });

    it('returns null for empty string', () => {
      const result = findMatch('', testData);
      expect(result).toEqual([null, null]);
    });

    it('returns null when not all words match', () => {
      const result = findMatch('ancient dragon', testData);
      expect(result).toEqual([null, null]);
    });
  });

  describe('edge cases', () => {
    it('handles empty data dict', () => {
      const result = findMatch('test', {});
      expect(result).toEqual([null, null]);
    });

    it('handles whitespace in input', () => {
      const result = findMatch('  goblin  ', testData);
      expect(result).toEqual(['goblin', testData.goblin]);
    });
  });
});
