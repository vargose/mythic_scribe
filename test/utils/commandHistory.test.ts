import { describe, it, expect, beforeEach } from 'vitest';
import { CommandHistory } from '../../src/utils/commandHistory';

describe('CommandHistory', () => {
  let history: CommandHistory;

  beforeEach(() => {
    history = new CommandHistory();
  });

  describe('add', () => {
    it('adds command to history', () => {
      history.add('look');
      expect(history.getCurrent()).toBe('');
      history.previous();
      expect(history.getCurrent()).toBe('look');
    });

    it('skips duplicate consecutive commands', () => {
      history.add('look');
      history.add('look');
      history.previous();
      expect(history.getCurrent()).toBe('look');
      history.previous();
      expect(history.getCurrent()).toBe('look'); // Only one 'look' in history
    });

    it('adds non-consecutive duplicates', () => {
      history.add('look');
      history.add('inventory');
      history.add('look');

      history.previous();
      expect(history.getCurrent()).toBe('look');
      history.previous();
      expect(history.getCurrent()).toBe('inventory');
      history.previous();
      expect(history.getCurrent()).toBe('look');
    });

    it('skips empty commands', () => {
      history.add('');
      history.add('  ');
      history.previous();
      expect(history.getCurrent()).toBe('');
    });

    it('trims whitespace from commands', () => {
      history.add('  look  ');
      history.previous();
      expect(history.getCurrent()).toBe('look');
    });
  });

  describe('previous', () => {
    beforeEach(() => {
      history.add('look');
      history.add('inventory');
      history.add('quests');
    });

    it('navigates to previous command', () => {
      history.previous();
      expect(history.getCurrent()).toBe('quests');
      history.previous();
      expect(history.getCurrent()).toBe('inventory');
      history.previous();
      expect(history.getCurrent()).toBe('look');
    });

    it('stops at oldest command', () => {
      history.previous(); // quests
      history.previous(); // inventory
      history.previous(); // look
      history.previous(); // still look
      expect(history.getCurrent()).toBe('look');
    });

    it('returns empty string when no history', () => {
      const emptyHistory = new CommandHistory();
      emptyHistory.previous();
      expect(emptyHistory.getCurrent()).toBe('');
    });
  });

  describe('next', () => {
    beforeEach(() => {
      history.add('look');
      history.add('inventory');
      history.add('quests');
      // Navigate to oldest
      history.previous();
      history.previous();
      history.previous();
    });

    it('navigates to next command', () => {
      expect(history.getCurrent()).toBe('look');
      history.next();
      expect(history.getCurrent()).toBe('inventory');
      history.next();
      expect(history.getCurrent()).toBe('quests');
    });

    it('clears input when going past last command', () => {
      history.next(); // inventory
      history.next(); // quests
      history.next(); // past end, should clear
      expect(history.getCurrent()).toBe('');
    });

    it('stays cleared after reaching end', () => {
      history.next(); // inventory
      history.next(); // quests
      history.next(); // cleared
      history.next(); // still cleared
      expect(history.getCurrent()).toBe('');
    });
  });

  describe('navigation workflow', () => {
    it('allows moving up and down through history', () => {
      history.add('cmd1');
      history.add('cmd2');
      history.add('cmd3');

      history.previous();
      expect(history.getCurrent()).toBe('cmd3');

      history.previous();
      expect(history.getCurrent()).toBe('cmd2');

      history.next();
      expect(history.getCurrent()).toBe('cmd3');

      history.next();
      expect(history.getCurrent()).toBe('');
    });

    it('resets to end after adding new command', () => {
      history.add('cmd1');
      history.add('cmd2');

      history.previous();
      history.previous();
      expect(history.getCurrent()).toBe('cmd1');

      history.add('cmd3');
      history.previous();
      expect(history.getCurrent()).toBe('cmd3');
    });
  });

  describe('getCurrent', () => {
    it('returns empty string initially', () => {
      expect(history.getCurrent()).toBe('');
    });

    it('returns current command in history', () => {
      history.add('look');
      history.previous();
      expect(history.getCurrent()).toBe('look');
    });
  });
});
