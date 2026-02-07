// Core game type definitions

export type QuestStatus = 'available' | 'active' | 'completed';
export type LocationKey = 'scribe_office' | 'whispering_woods';

export interface Creature {
  name: string;
  description: string;
  danger_level: string;
  documented: boolean;
  ascii_art: string;
}

export interface Quest {
  name: string;
  description: string;
  reward: string;
  status: QuestStatus;
}

export interface Lore {
  title: string;
  text: string;
  discovered: boolean;
  ascii_art: string;
}

export interface Player {
  name: string;
  gold: number;
  inventory: string[];
  current_location: LocationKey;
}

export interface GameState {
  player: Player;
  creatures: Record<string, Creature>;
  quests: Record<string, Quest>;
  lore: Record<string, Lore>;
}

export interface CommandResult {
  newState: GameState;
  messages: string[];
  shouldExit?: boolean;
}

export interface LocationHintRule {
  questStatus?: { quest: string; status: QuestStatus };
  creatureDocumented?: { creature: string; documented: boolean };
  allCreaturesDocumented?: { creatures: string[] };
  message: string;
}

export interface Location {
  key: LocationKey;
  name: string;
  description: string;
  ascii_art: string;
  exits: string;
  hints?: LocationHintRule[];
}

export interface DestinationMap {
  [fromLocation: string]: Record<string, LocationKey>;
}
