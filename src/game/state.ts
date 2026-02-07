import { GameState, LocationKey, QuestStatus } from './types.js';
import { creatures as initialCreatures } from '../data/creatures.js';
import { quests as initialQuests } from '../data/quests.js';
import { lore as initialLore } from '../data/lore.js';

/**
 * Creates the initial game state with default values
 */
export function createInitialState(): GameState {
  return {
    player: {
      name: 'Scribe',
      gold: 100,
      inventory: [],
      current_location: 'scribe_office'
    },
    creatures: JSON.parse(JSON.stringify(initialCreatures)),
    quests: JSON.parse(JSON.stringify(initialQuests)),
    lore: JSON.parse(JSON.stringify(initialLore))
  };
}

/**
 * Updates player gold amount (immutable)
 */
export function updatePlayerGold(state: GameState, amount: number): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold + amount
    }
  };
}

/**
 * Adds an item to player inventory (immutable)
 */
export function addToInventory(state: GameState, item: string): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      inventory: [...state.player.inventory, item]
    }
  };
}

/**
 * Changes player's current location (immutable)
 */
export function changeLocation(state: GameState, location: LocationKey): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      current_location: location
    }
  };
}

/**
 * Marks a creature as documented (immutable)
 */
export function documentCreature(state: GameState, creatureKey: string): GameState {
  return {
    ...state,
    creatures: {
      ...state.creatures,
      [creatureKey]: {
        ...state.creatures[creatureKey],
        documented: true
      }
    }
  };
}

/**
 * Updates a quest's status (immutable)
 */
export function updateQuestStatus(
  state: GameState,
  questKey: string,
  status: QuestStatus
): GameState {
  return {
    ...state,
    quests: {
      ...state.quests,
      [questKey]: {
        ...state.quests[questKey],
        status
      }
    }
  };
}

/**
 * Marks lore as discovered (immutable)
 */
export function discoverLore(state: GameState, loreKey: string): GameState {
  return {
    ...state,
    lore: {
      ...state.lore,
      [loreKey]: {
        ...state.lore[loreKey],
        discovered: true
      }
    }
  };
}
