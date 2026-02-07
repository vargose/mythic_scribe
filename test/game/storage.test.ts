import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { saveGameState, loadGameState, getSavePath } from '../../src/game/storage';
import { createInitialState, documentCreature, updatePlayerGold } from '../../src/game/state';
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

describe('storage', () => {
  const testSaveDir = join(homedir(), '.mythic-scribe-test');
  const testSavePath = join(testSaveDir, 'save.json');

  beforeEach(async () => {
    // Create test directory
    await fs.mkdir(testSaveDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(testSaveDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore errors
    }
  });

  describe('getSavePath', () => {
    it('returns path to ~/.mythic-scribe/save.json', () => {
      const path = getSavePath();
      expect(path).toContain('.mythic-scribe');
      expect(path).toContain('save.json');
    });
  });

  describe('saveGameState', () => {
    it('saves game state to JSON file', async () => {
      const state = createInitialState();
      await saveGameState(state, testSavePath);

      const fileContent = await fs.readFile(testSavePath, 'utf-8');
      const saved = JSON.parse(fileContent);

      expect(saved.player.name).toBe('Scribe');
      expect(saved.player.gold).toBe(100);
    });

    it('creates directory if it does not exist', async () => {
      const nonExistentDir = join(homedir(), '.mythic-scribe-test-new');
      const savePath = join(nonExistentDir, 'save.json');

      const state = createInitialState();
      await saveGameState(state, savePath);

      const exists = await fs.access(savePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // Cleanup
      await fs.rm(nonExistentDir, { recursive: true, force: true });
    });

    it('overwrites existing save file', async () => {
      let state = createInitialState();
      await saveGameState(state, testSavePath);

      state = updatePlayerGold(state, 50);
      await saveGameState(state, testSavePath);

      const fileContent = await fs.readFile(testSavePath, 'utf-8');
      const saved = JSON.parse(fileContent);

      expect(saved.player.gold).toBe(150);
    });
  });

  describe('loadGameState', () => {
    it('loads game state from JSON file', async () => {
      const originalState = createInitialState();
      const modifiedState = documentCreature(
        updatePlayerGold(originalState, 50),
        'goblin'
      );

      await saveGameState(modifiedState, testSavePath);
      const loaded = await loadGameState(testSavePath);

      expect(loaded.player.gold).toBe(150);
      expect(loaded.creatures.goblin.documented).toBe(true);
    });

    it('returns default state if no save file exists', async () => {
      const nonExistentPath = join(testSaveDir, 'does-not-exist.json');
      const loaded = await loadGameState(nonExistentPath);

      expect(loaded.player.name).toBe('Scribe');
      expect(loaded.player.gold).toBe(100);
      expect(loaded.creatures.goblin.documented).toBe(false);
    });

    it('handles corrupted save files gracefully', async () => {
      await fs.writeFile(testSavePath, 'invalid json {{{', 'utf-8');

      const loaded = await loadGameState(testSavePath);

      // Should return default state
      expect(loaded.player.name).toBe('Scribe');
      expect(loaded.player.gold).toBe(100);
    });

    it('preserves all game state properties', async () => {
      const state = createInitialState();
      state.player.inventory = ['Health Potion', 'Sword'];
      state.player.current_location = 'whispering_woods';
      state.quests.first_quest.status = 'active';
      state.lore.ancient_ruins.discovered = true;

      await saveGameState(state, testSavePath);
      const loaded = await loadGameState(testSavePath);

      expect(loaded.player.inventory).toEqual(['Health Potion', 'Sword']);
      expect(loaded.player.current_location).toBe('whispering_woods');
      expect(loaded.quests.first_quest.status).toBe('active');
      expect(loaded.lore.ancient_ruins.discovered).toBe(true);
    });
  });
});
