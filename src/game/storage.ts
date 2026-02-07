import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { GameState } from './types.js';
import { createInitialState } from './state.js';

/**
 * Get the path to the save file
 */
export function getSavePath(): string {
  return join(homedir(), '.mythic-scribe', 'save.json');
}

/**
 * Save game state to JSON file
 */
export async function saveGameState(
  state: GameState,
  savePath: string = getSavePath()
): Promise<void> {
  try {
    // Create directory if it doesn't exist
    const dir = dirname(savePath);
    await fs.mkdir(dir, { recursive: true });

    // Write state to file
    const json = JSON.stringify(state, null, 2);
    await fs.writeFile(savePath, json, 'utf-8');
  } catch (error) {
    console.error('Failed to save game state:', error);
    throw error;
  }
}

/**
 * Load game state from JSON file
 * Returns default state if file doesn't exist or is corrupted
 */
export async function loadGameState(
  savePath: string = getSavePath()
): Promise<GameState> {
  try {
    const fileContent = await fs.readFile(savePath, 'utf-8');
    const state = JSON.parse(fileContent) as GameState;
    return state;
  } catch (error) {
    // File doesn't exist or is corrupted - return default state
    return createInitialState();
  }
}
