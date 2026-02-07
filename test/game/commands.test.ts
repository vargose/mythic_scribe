import { describe, it, expect, beforeEach } from 'vitest';
import { processCommand, normalizeCommand } from '../../src/game/commands';
import { createInitialState } from '../../src/game/state';
import { GameState } from '../../src/game/types';

describe('Command Processing', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialState();
  });

  describe('normalizeCommand', () => {
    it('converts to lowercase', () => {
      expect(normalizeCommand('QUIT')).toBe('quit');
      expect(normalizeCommand('HeLp')).toBe('help');
    });

    it('applies doc alias', () => {
      expect(normalizeCommand('doc')).toBe('document creature');
    });

    it('applies quest alias', () => {
      expect(normalizeCommand('quest')).toBe('quests');
    });

    it('applies creat alias', () => {
      expect(normalizeCommand('creat')).toBe('creatures');
    });

    it('applies inv alias', () => {
      expect(normalizeCommand('inv')).toBe('inventory');
    });

    it('trims whitespace', () => {
      expect(normalizeCommand('  quit  ')).toBe('quit');
    });
  });

  describe('quit command', () => {
    it('sets shouldExit flag', () => {
      const result = processCommand('quit', state);
      expect(result.shouldExit).toBe(true);
    });

    it('exit command also works', () => {
      const result = processCommand('exit', state);
      expect(result.shouldExit).toBe(true);
    });
  });

  describe('look command', () => {
    it('returns location information', () => {
      const result = processCommand('look', state);
      expect(result.messages.some(m => m.includes('Scribe'))).toBe(true);
    });
  });

  describe('quests command', () => {
    it('lists all quests with status', () => {
      const result = processCommand('quests', state);
      expect(result.messages.some(m => m.includes('Whispering Woods'))).toBe(true);
      expect(result.messages.some(m => m.includes('available'))).toBe(true);
    });
  });

  describe('take quest command', () => {
    it('activates available quest', () => {
      const result = processCommand('take quest whispering woods', state);
      expect(result.newState.quests.first_quest.status).toBe('active');
      expect(result.messages.some(m => m.includes('taken'))).toBe(true);
    });

    it('handles fuzzy quest name matching', () => {
      const result = processCommand('take quest woods', state);
      expect(result.newState.quests.first_quest.status).toBe('active');
    });

    it('rejects already active quest', () => {
      state.quests.first_quest.status = 'active';
      const result = processCommand('take quest whispering woods', state);
      expect(result.newState.quests.first_quest.status).toBe('active');
      expect(result.messages.some(m => m.includes('already'))).toBe(true);
    });

    it('rejects completed quest', () => {
      state.quests.first_quest.status = 'completed';
      const result = processCommand('take quest whispering woods', state);
      expect(result.messages.some(m => m.includes('completed'))).toBe(true);
    });

    it('handles unknown quest name', () => {
      const result = processCommand('take quest dragon slayer', state);
      expect(result.messages.some(m => m.toLowerCase().includes('not found'))).toBe(true);
    });
  });

  describe('complete quest command', () => {
    beforeEach(() => {
      state.quests.first_quest.status = 'active';
    });

    it('completes quest with requirements met', () => {
      state.creatures.goblin.documented = true;
      state.creatures.dire_wolf.documented = true;

      const result = processCommand('complete quest whispering woods', state);
      expect(result.newState.quests.first_quest.status).toBe('completed');
      expect(result.newState.player.gold).toBe(150); // 100 + 50 reward
      expect(result.messages.some(m => m.includes('completed'))).toBe(true);
    });

    it('rejects quest without requirements (first_quest needs 2 creatures)', () => {
      state.creatures.goblin.documented = true;
      state.creatures.dire_wolf.documented = false;

      const result = processCommand('complete quest woods', state);
      expect(result.newState.quests.first_quest.status).toBe('active');
      expect(result.messages.some(m => m.includes('document all creatures'))).toBe(true);
    });

    it('rejects non-active quest', () => {
      state.quests.first_quest.status = 'available';
      const result = processCommand('complete quest woods', state);
      expect(result.messages.some(m => m.includes('not active'))).toBe(true);
    });

    it('handles already completed quest', () => {
      state.quests.first_quest.status = 'completed';
      const result = processCommand('complete quest woods', state);
      expect(result.messages.some(m => m.includes('already completed'))).toBe(true);
    });
  });

  describe('document creature command', () => {
    it('documents a creature', () => {
      const result = processCommand('document creature goblin', state);
      expect(result.newState.creatures.goblin.documented).toBe(true);
      expect(result.messages.some(m => m.includes('documented'))).toBe(true);
    });

    it('handles fuzzy creature name matching', () => {
      const result = processCommand('document creature wolf', state);
      expect(result.newState.creatures.dire_wolf.documented).toBe(true);
    });

    it('rejects already documented creature', () => {
      state.creatures.goblin.documented = true;
      const result = processCommand('document creature goblin', state);
      expect(result.messages.some(m => m.includes('already documented'))).toBe(true);
    });

    it('handles unknown creature', () => {
      const result = processCommand('document creature dragon', state);
      expect(result.messages.some(m => m.toLowerCase().includes('not found'))).toBe(true);
    });
  });

  describe('go command', () => {
    it('navigates to valid destination', () => {
      const result = processCommand('go whispering woods', state);
      expect(result.newState.player.current_location).toBe('whispering_woods');
    });

    it('uses flexible destination matching', () => {
      const result = processCommand('go woods', state);
      expect(result.newState.player.current_location).toBe('whispering_woods');
    });

    it('navigates back from whispering woods', () => {
      state.player.current_location = 'whispering_woods';
      const result = processCommand('go back', state);
      expect(result.newState.player.current_location).toBe('scribe_office');
    });

    it('rejects invalid destination', () => {
      const result = processCommand('go dragon lair', state);
      expect(result.messages.some(m => m.includes('cannot go that way'))).toBe(true);
      expect(result.newState.player.current_location).toBe('scribe_office');
    });
  });

  describe('inventory command', () => {
    it('shows empty inventory', () => {
      const result = processCommand('inventory', state);
      expect(result.messages.some(m => m.includes('empty'))).toBe(true);
      expect(result.messages.some(m => m.includes('100'))).toBe(true); // gold
    });

    it('shows items in inventory', () => {
      state.player.inventory = ['Health Potion', 'Sword'];
      const result = processCommand('inventory', state);
      expect(result.messages.some(m => m.includes('Health Potion'))).toBe(true);
      expect(result.messages.some(m => m.includes('Sword'))).toBe(true);
    });
  });

  describe('creatures command', () => {
    it('lists documented creatures', () => {
      state.creatures.goblin.documented = true;
      const result = processCommand('creatures', state);
      expect(result.messages.some(m => m.includes('Goblin'))).toBe(true);
      expect(result.messages.some(m => m.includes('green-skinned'))).toBe(true);
    });

    it('lists undocumented creatures', () => {
      const result = processCommand('creatures', state);
      expect(result.messages.some(m => m.includes('Undocumented'))).toBe(true);
    });
  });

  describe('lore command', () => {
    it('lists discovered lore', () => {
      state.lore.ancient_ruins.discovered = true;
      const result = processCommand('lore', state);
      expect(result.messages.some(m => m.includes('Ancient Ruins'))).toBe(true);
      expect(result.messages.some(m => m.includes('ancient civilization'))).toBe(true);
    });

    it('lists undiscovered lore', () => {
      const result = processCommand('lore', state);
      expect(result.messages.some(m => m.includes('Undiscovered'))).toBe(true);
    });
  });

  describe('help command', () => {
    it('shows available commands', () => {
      const result = processCommand('help', state);
      expect(result.messages.some(m => m.includes('look'))).toBe(true);
      expect(result.messages.some(m => m.includes('quit'))).toBe(true);
      expect(result.messages.some(m => m.includes('document'))).toBe(true);
    });
  });

  describe('unknown command', () => {
    it('shows error message', () => {
      const result = processCommand('invalid command', state);
      expect(result.messages.some(m => m.toLowerCase().includes('unknown'))).toBe(true);
    });

    it('provides suggestions for common typos', () => {
      const result = processCommand('documnt goblin', state);
      expect(result.messages.some(m => m.includes('document creature'))).toBe(true);
    });
  });
});
