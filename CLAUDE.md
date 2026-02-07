# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mythic Scribe is a text-based adventure game where players document creatures and lore in the world of Eldoria. Built with TypeScript, React, and Ink for a modern terminal UI with comprehensive test coverage (>89%).

## Running the Game

```bash
npm install    # First time setup
npm start      # Run the compiled game
npm run dev    # Development mode with hot reload
```

## Development Commands

```bash
npm test              # Run tests in watch mode
npm run coverage      # Generate coverage report (must meet 89% threshold)
npm run type-check    # Check TypeScript types
npm run build         # Compile TypeScript to JavaScript
```

## Architecture

### Directory Structure

```
src/
├── components/       # React Ink UI components
│   └── App.tsx      # Main app component with game loop
├── game/            # Core game logic (pure TypeScript)
│   ├── types.ts     # TypeScript interfaces & types
│   ├── state.ts     # Immutable state management
│   ├── commands.ts  # Command parser & handlers
│   ├── matcher.ts   # Fuzzy matching algorithm
│   └── storage.ts   # JSON save/load persistence
├── data/            # Game content
│   ├── creatures.ts # Creature definitions
│   ├── quests.ts    # Quest definitions
│   ├── lore.ts      # Lore entries
│   └── locations.ts # Location data & navigation
├── utils/
│   └── commandHistory.ts  # ↑/↓ arrow navigation
└── index.tsx        # Entry point

test/                # Vitest test files (mirrors src/)
```

### State Management

**Immutable updates**: All state mutations create new objects via spread operators:
```typescript
updatePlayerGold(state, amount) => { ...state, player: { ...state.player, gold: state.player.gold + amount } }
```

**GameState interface**: Single source of truth containing `player`, `creatures`, `quests`, `lore`

**Save/Load**: Automatic JSON persistence to `~/.mythic-scribe/save.json` after each command

### Command System

**Processing flow**:
1. `normalizeCommand()` - Lowercase, apply aliases (`doc` → `document creature`)
2. `processCommand()` - Pattern matching via `startsWith()`
3. Handler functions - Return `CommandResult` with `newState` and `messages[]`

**Aliases**: `doc`, `inv`, `quest`, `creat` defined in `commands.ts`

**Command handlers**: Pure functions that take state, return new state + output messages

### Fuzzy Matching Algorithm

`findMatch(input, dataDict)` - 3-tier matching:
1. **Exact**: Input matches name or key (case-insensitive, `_` → space)
2. **Partial**: Input is substring of name or key
3. **Word-based**: All input words present in target (e.g., "ruins ancient" matches "ancient_ruins")

Returns `[key, item]` tuple or `[null, null]`

### Location System

**Static locations**: `scribe_office`, `whispering_woods` defined in `src/data/locations.ts`

**Navigation**: `possibleDestinations` object maps user phrases to location keys:
```typescript
'scribe_office': { 'whispering woods': 'whispering_woods', 'woods': 'whispering_woods' }
```

**Contextual hints**: `handleLook()` provides quest/creature suggestions based on location + state

### Quest Completion Logic

`first_quest` ("The Whispering Woods") requires special validation:
- Checks both `goblin` and `dire_wolf` are documented
- Parses gold reward from quest.reward string (`"50 gold"` → 50)
- Other quests can use simpler completion logic

### React Ink UI

**App component** (`src/components/App.tsx`):
- Manages game state with `useState<GameState>`
- Loads saved game on mount via `useEffect`
- Handles keyboard input with `useInput` hook
- Auto-saves after each command
- Exits on `quit` command via `useApp().exit()`

**Input handling**: Arrow keys for history, Enter to submit, backspace/delete support

## Testing

**Coverage requirements**: 89% on lines, branches, functions, statements

**Test files**: Mirror `src/` structure in `test/` directory

**Current coverage**: 94.87% lines, 91.4% branches, 100% functions

**Excluded from coverage**: `src/components/` (UI), `src/index.tsx`, `src/game/types.ts`

**Run tests**: `npm test` (watch mode) or `npm run coverage` (with report)

## Adding Content

**New creature**: Add to `src/data/creatures.ts`:
```typescript
new_creature: {
  name: 'Creature Name',
  description: 'Description text',
  danger_level: 'low' | 'medium' | 'high',
  documented: false,
  ascii_art: `ASCII art string`
}
```

**New quest**: Add to `src/data/quests.ts`:
```typescript
quest_key: {
  name: 'Quest Name',
  description: 'Quest description',
  reward: '50 gold',
  status: 'available' as QuestStatus
}
```

**New location**:
1. Add to `LocationKey` type in `types.ts`
2. Add to `locations` object in `data/locations.ts`
3. Update `possibleDestinations` for navigation
4. Add contextual hints in `handleLook()` if needed

**New lore**: Add to `src/data/lore.ts` (same pattern as creatures)

## Key Differences from Python Version

- **Immutable state** instead of direct mutations
- **TypeScript** for type safety
- **Automatic save/load** instead of session-only state
- **Test-driven** with 93 test cases
- **Modular** - game logic separated from UI
- **React/Ink** instead of Textual framework

## CRUSH.md

Original Python architecture documented in `CRUSH.md` and preserved in `python_backup/` directory.
