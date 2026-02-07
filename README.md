# Mythic Scribe

A text-based adventure game where you document creatures and lore in the world of Eldoria. Built with TypeScript, React, and Ink for a modern terminal UI experience.

## Installation

```bash
npm install
```

## Running the Game

```bash
npm start
```

Or for development with hot reload:

```bash
npm run dev
```

## Development

```bash
# Run tests
npm test

# Run tests with coverage
npm run coverage

# Type check
npm run type-check

# Build for production
npm run build
```

## Game Features

- **Document Creatures**: Discover and catalog the creatures of Eldoria
- **Complete Quests**: Take on adventures and earn rewards
- **Explore Locations**: Navigate between the Scribe's Office and Whispering Woods
- **Persistent Save System**: Your progress is automatically saved
- **Fuzzy Command Matching**: Type partial commands for faster gameplay

## Commands

- `look` - Describes your current location
- `quests` - Lists all available quests
- `take quest [name]` - Accept a quest
- `complete quest [name]` - Finish an active quest
- `document creature [name]` - Document a creature
- `creatures` - View documented creatures
- `lore` - View discovered lore
- `inventory` - Check your gold and items
- `go [destination]` - Travel to a new location
- `help` - Show all commands
- `quit` or `exit` - Exit the game

**Shortcuts**: `doc`, `inv`, `quest`, `creat`

## Test Coverage

Maintains >89% code coverage across all metrics:
- **Lines**: 94.87%
- **Branches**: 91.4%
- **Functions**: 100%

Run `npm run coverage` to generate a detailed coverage report.

## Architecture

- **TypeScript** for type safety
- **React + Ink** for terminal UI rendering
- **Vitest** for testing with 93 test cases
- **JSON persistence** for save/load functionality

Save files are stored at `~/.mythic-scribe/save.json`

## Original Python Version

The original Python/Textual implementation is preserved in `python_backup/` for reference.
