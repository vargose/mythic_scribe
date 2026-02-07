import { GameState, CommandResult } from './types.js';
import { findMatch } from './matcher.js';
import { locations, possibleDestinations } from '../data/locations.js';
import {
  updatePlayerGold,
  changeLocation,
  documentCreature as docCreature,
  updateQuestStatus,
} from './state.js';

/**
 * Command aliases
 */
const ALIASES: Record<string, string> = {
  doc: 'document creature',
  quest: 'quests',
  creat: 'creatures',
  inv: 'inventory',
};

/**
 * Normalize command (lowercase, apply aliases, trim)
 */
export function normalizeCommand(command: string): string {
  const normalized = command.toLowerCase().trim();
  return ALIASES[normalized] || normalized;
}

/**
 * Main command processor
 */
export function processCommand(command: string, state: GameState): CommandResult {
  const normalized = normalizeCommand(command);

  // Quit/Exit
  if (normalized === 'quit' || normalized === 'exit') {
    return {
      newState: state,
      messages: ['Farewell, Scribe.'],
      shouldExit: true,
    };
  }

  // Look
  if (normalized === 'look') {
    return handleLook(state);
  }

  // Quests
  if (normalized === 'quests') {
    return handleQuests(state);
  }

  // Take quest
  if (normalized.startsWith('take quest ')) {
    const questInput = normalized.substring('take quest '.length).trim();
    return handleTakeQuest(state, questInput);
  }

  // Complete quest
  if (normalized.startsWith('complete quest ')) {
    const questInput = normalized.substring('complete quest '.length).trim();
    return handleCompleteQuest(state, questInput);
  }

  // Document creature
  if (normalized.startsWith('document creature ')) {
    const creatureInput = normalized.substring('document creature '.length).trim();
    return handleDocumentCreature(state, creatureInput);
  }

  // Creatures
  if (normalized === 'creatures') {
    return handleCreatures(state);
  }

  // Lore
  if (normalized === 'lore') {
    return handleLore(state);
  }

  // Inventory
  if (normalized === 'inventory') {
    return handleInventory(state);
  }

  // Go
  if (normalized.startsWith('go ')) {
    const destination = normalized.substring('go '.length).trim();
    return handleGo(state, destination);
  }

  // Help
  if (normalized === 'help') {
    return handleHelp(state);
  }

  // Unknown command
  return handleUnknown(state, normalized);
}

function handleLook(state: GameState): CommandResult {
  const location = locations[state.player.current_location];
  const messages = [
    `\n=== ${location.name} ===`,
    location.ascii_art,
    location.description,
    location.exits,
  ];

  // Evaluate declarative hint rules
  if (location.hints) {
    for (const rule of location.hints) {
      if (evaluateHintRule(rule, state)) {
        messages.push(rule.message);
      }
    }
  }

  return { newState: state, messages };
}

/**
 * Evaluates a declarative hint rule against game state
 * Pure data evaluation - no eval or function execution
 */
function evaluateHintRule(rule: any, state: GameState): boolean {
  // Check quest status condition
  if (rule.questStatus) {
    const quest = state.quests[rule.questStatus.quest];
    if (!quest || quest.status !== rule.questStatus.status) {
      return false;
    }
  }

  // Check creature documented condition
  if (rule.creatureDocumented) {
    const creature = state.creatures[rule.creatureDocumented.creature];
    if (!creature || creature.documented !== rule.creatureDocumented.documented) {
      return false;
    }
  }

  // Check all creatures documented condition
  if (rule.allCreaturesDocumented) {
    const allDocumented = rule.allCreaturesDocumented.creatures.every(
      (creatureName: string) => state.creatures[creatureName]?.documented === true
    );
    if (!allDocumented) {
      return false;
    }
  }

  return true;
}

function handleQuests(state: GameState): CommandResult {
  const messages = ['\n--- Quests ---'];
  for (const [key, quest] of Object.entries(state.quests)) {
    messages.push(`- ${quest.name} (${quest.status})`);
  }
  return { newState: state, messages };
}

function handleTakeQuest(state: GameState, questInput: string): CommandResult {
  const [questKey, quest] = findMatch(questInput, state.quests);

  if (!quest) {
    return {
      newState: state,
      messages: [`Quest '${questInput}' not found.`],
    };
  }

  if (quest.status === 'available') {
    const newState = updateQuestStatus(state, questKey!, 'active');
    return {
      newState,
      messages: [`You have taken the quest: ${quest.name}.`],
    };
  } else if (quest.status === 'active') {
    return {
      newState: state,
      messages: [`You are already on the quest: ${quest.name}.`],
    };
  } else {
    return {
      newState: state,
      messages: [`The quest ${quest.name} is already ${quest.status}.`],
    };
  }
}

function handleCompleteQuest(state: GameState, questInput: string): CommandResult {
  const [questKey, quest] = findMatch(questInput, state.quests);

  if (!quest) {
    return {
      newState: state,
      messages: [`Quest '${questInput}' not found.`],
    };
  }

  if (quest.status === 'completed') {
    return {
      newState: state,
      messages: [`The quest ${quest.name} is already completed.`],
    };
  }

  if (quest.status !== 'active') {
    return {
      newState: state,
      messages: [`The quest ${quest.name} is not active.`],
    };
  }

  // Special logic for first_quest - requires documenting both creatures
  if (questKey === 'first_quest') {
    if (!state.creatures.goblin.documented || !state.creatures.dire_wolf.documented) {
      return {
        newState: state,
        messages: ["You must document all creatures for 'The Whispering Woods' before completing it."],
      };
    }
  }

  // Complete quest and award gold
  const goldAmount = parseInt(quest.reward.split(' ')[0]);
  let newState = updateQuestStatus(state, questKey!, 'completed');
  newState = updatePlayerGold(newState, goldAmount);

  return {
    newState,
    messages: [
      `You have completed the quest: ${quest.name}. You received ${quest.reward}.`,
    ],
  };
}

function handleDocumentCreature(state: GameState, creatureInput: string): CommandResult {
  const [creatureKey, creature] = findMatch(creatureInput, state.creatures);

  if (!creature) {
    return {
      newState: state,
      messages: [`Creature '${creatureInput}' not found.`],
    };
  }

  if (creature.documented) {
    return {
      newState: state,
      messages: [`The ${creature.name} is already documented.`],
    };
  }

  const newState = docCreature(state, creatureKey!);
  const messages = [`You have documented the ${creature.name}.`];
  if (creature.ascii_art) {
    messages.push(creature.ascii_art);
  }

  return { newState, messages };
}

function handleCreatures(state: GameState): CommandResult {
  const messages = ['\n--- Documented Creatures ---'];
  for (const [key, creature] of Object.entries(state.creatures)) {
    if (creature.documented) {
      messages.push(`- ${creature.name}: ${creature.description}`);
      if (creature.ascii_art) {
        messages.push(creature.ascii_art);
      }
    } else {
      messages.push(`- ${creature.name}: Undocumented`);
    }
  }
  return { newState: state, messages };
}

function handleLore(state: GameState): CommandResult {
  const messages = ['\n--- Discovered Lore ---'];
  for (const [key, loreItem] of Object.entries(state.lore)) {
    if (loreItem.discovered) {
      messages.push(`- ${loreItem.title}: ${loreItem.text}`);
      if (loreItem.ascii_art) {
        messages.push(loreItem.ascii_art);
      }
    } else {
      messages.push(`- ${loreItem.title}: Undiscovered`);
    }
  }
  return { newState: state, messages };
}

function handleInventory(state: GameState): CommandResult {
  const messages = ['\n--- Inventory ---'];
  if (state.player.inventory.length > 0) {
    for (const item of state.player.inventory) {
      messages.push(`- ${item}`);
    }
  } else {
    messages.push('Your inventory is empty.');
  }
  messages.push(`Gold: ${state.player.gold}`);
  return { newState: state, messages };
}

function handleGo(state: GameState, destination: string): CommandResult {
  const currentLocation = state.player.current_location;
  const destinationMap = possibleDestinations[currentLocation] || {};

  let matchedDestination = null;
  for (const [keyPhrase, actualLocation] of Object.entries(destinationMap)) {
    if (destination === keyPhrase || destination.includes(keyPhrase) || keyPhrase.includes(destination)) {
      matchedDestination = actualLocation;
      break;
    }
  }

  if (matchedDestination) {
    const newState = changeLocation(state, matchedDestination);
    return handleLook(newState);
  } else {
    return {
      newState: state,
      messages: ['You cannot go that way from here.'],
    };
  }
}

function handleHelp(state: GameState): CommandResult {
  const messages = [
    '\n--- Available Commands ---',
    '  look: Describes your current location.',
    '  quests: Lists all quests and their status.',
    '  take quest [quest name]: Attempts to take an available quest.',
    '  complete quest [quest name]: Attempts to complete an active quest.',
    '  document creature [creature name]: Attempts to document a creature in your current location.',
    '  creatures: Shows documented and undocumented creatures.',
    '  lore: Shows discovered and undiscovered lore entries.',
    '  inventory: Displays your gold and items.',
    '  go [destination]: Moves you to a new location.',
    '  quit/exit: Exits the game.',
    '\n--- Shortcuts ---',
    '  doc → document creature',
    '  inv → inventory',
    '  quest → quests',
    '  creat → creatures',
  ];
  return { newState: state, messages };
}

function handleUnknown(state: GameState, command: string): CommandResult {
  const messages = ["Unknown command. Type 'help' for a list of commands."];

  // Common command suggestions - check compound patterns first
  if (command.includes('take') && command.includes('wood')) {
    messages.push("Did you mean 'take quest woods'?");
  } else if (command.includes('complete') && command.includes('wood')) {
    messages.push("Did you mean 'complete quest woods'?");
  } else if (command.includes('goblin') || command.includes('wolf')) {
    messages.push("Did you mean 'document creature goblin'?");
  } else if (command.includes('wood')) {
    messages.push("Did you mean 'go woods' or 'take quest woods'?");
  } else if (command.includes('quest')) {
    messages.push("Did you mean 'quests' or 'take quest [name]'?");
  } else if (command.includes('creat')) {
    messages.push("Did you mean 'creatures'?");
  } else if (command.includes('doc')) {
    messages.push("Did you mean 'document creature [name]'?");
  } else if (command.includes('inv') || command.includes('inven')) {
    messages.push("Did you mean 'inventory'?");
  }

  return { newState: state, messages };
}
