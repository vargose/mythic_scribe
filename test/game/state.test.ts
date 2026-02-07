import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialState,
  updatePlayerGold,
  addToInventory,
  changeLocation,
  documentCreature,
  updateQuestStatus,
  discoverLore
} from '../../src/game/state';
import { GameState } from '../../src/game/types';

describe('GameState', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialState();
  });

  describe('createInitialState', () => {
    it('initializes with default player state', () => {
      expect(state.player.name).toBe('Scribe');
      expect(state.player.gold).toBe(100);
      expect(state.player.inventory).toEqual([]);
      expect(state.player.current_location).toBe('scribe_office');
    });

    it('initializes creatures as undocumented', () => {
      expect(state.creatures.goblin.documented).toBe(false);
      expect(state.creatures.dire_wolf.documented).toBe(false);
    });

    it('initializes first quest as available', () => {
      expect(state.quests.first_quest.status).toBe('available');
    });

    it('initializes lore as undiscovered', () => {
      expect(state.lore.ancient_ruins.discovered).toBe(false);
      expect(state.lore.the_eldor_tree.discovered).toBe(false);
    });
  });

  describe('updatePlayerGold', () => {
    it('increases player gold', () => {
      const newState = updatePlayerGold(state, 50);
      expect(newState.player.gold).toBe(150);
      expect(state.player.gold).toBe(100); // Original unchanged
    });

    it('decreases player gold', () => {
      const newState = updatePlayerGold(state, -50);
      expect(newState.player.gold).toBe(50);
    });

    it('can set gold to zero', () => {
      const newState = updatePlayerGold(state, -100);
      expect(newState.player.gold).toBe(0);
    });
  });

  describe('addToInventory', () => {
    it('adds item to inventory', () => {
      const newState = addToInventory(state, 'Health Potion');
      expect(newState.player.inventory).toContain('Health Potion');
      expect(newState.player.inventory).toHaveLength(1);
    });

    it('adds multiple items', () => {
      let newState = addToInventory(state, 'Health Potion');
      newState = addToInventory(newState, 'Sword');
      expect(newState.player.inventory).toEqual(['Health Potion', 'Sword']);
    });

    it('does not mutate original state', () => {
      const newState = addToInventory(state, 'Item');
      expect(state.player.inventory).toEqual([]);
      expect(newState.player.inventory).toEqual(['Item']);
    });
  });

  describe('changeLocation', () => {
    it('changes current location', () => {
      const newState = changeLocation(state, 'whispering_woods');
      expect(newState.player.current_location).toBe('whispering_woods');
      expect(state.player.current_location).toBe('scribe_office');
    });

    it('can return to previous location', () => {
      let newState = changeLocation(state, 'whispering_woods');
      newState = changeLocation(newState, 'scribe_office');
      expect(newState.player.current_location).toBe('scribe_office');
    });
  });

  describe('documentCreature', () => {
    it('marks creature as documented', () => {
      const newState = documentCreature(state, 'goblin');
      expect(newState.creatures.goblin.documented).toBe(true);
      expect(state.creatures.goblin.documented).toBe(false);
    });

    it('documents multiple creatures independently', () => {
      let newState = documentCreature(state, 'goblin');
      expect(newState.creatures.goblin.documented).toBe(true);
      expect(newState.creatures.dire_wolf.documented).toBe(false);

      newState = documentCreature(newState, 'dire_wolf');
      expect(newState.creatures.goblin.documented).toBe(true);
      expect(newState.creatures.dire_wolf.documented).toBe(true);
    });

    it('handles documenting already documented creature', () => {
      let newState = documentCreature(state, 'goblin');
      newState = documentCreature(newState, 'goblin');
      expect(newState.creatures.goblin.documented).toBe(true);
    });
  });

  describe('updateQuestStatus', () => {
    it('updates quest status from available to active', () => {
      const newState = updateQuestStatus(state, 'first_quest', 'active');
      expect(newState.quests.first_quest.status).toBe('active');
      expect(state.quests.first_quest.status).toBe('available');
    });

    it('updates quest status from active to completed', () => {
      let newState = updateQuestStatus(state, 'first_quest', 'active');
      newState = updateQuestStatus(newState, 'first_quest', 'completed');
      expect(newState.quests.first_quest.status).toBe('completed');
    });
  });

  describe('discoverLore', () => {
    it('marks lore as discovered', () => {
      const newState = discoverLore(state, 'ancient_ruins');
      expect(newState.lore.ancient_ruins.discovered).toBe(true);
      expect(state.lore.ancient_ruins.discovered).toBe(false);
    });

    it('discovers multiple lore items', () => {
      let newState = discoverLore(state, 'ancient_ruins');
      newState = discoverLore(newState, 'the_eldor_tree');
      expect(newState.lore.ancient_ruins.discovered).toBe(true);
      expect(newState.lore.the_eldor_tree.discovered).toBe(true);
    });
  });
});
