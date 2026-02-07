# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mythic Scribe is a text-based adventure game where players document creatures and lore in the world of Eldoria. Built with Python using the Textual TUI framework for a terminal user interface.

## Running the Game

```bash
python main.py
```

Dependencies: `pip install -r requirements.txt` (installs `rich` and `textual`)

## Architecture

**Single-file TUI application**: `main.py` contains the entire `MythicScribeApp` class (Textual-based). All game logic, command parsing, and UI rendering are in this file.

**Game data modules** in `data/`:
- `creatures.py` - Creature definitions with `documented` state
- `quests.py` - Quest definitions with `status` tracking
- `lore.py` - Lore entries with `discovered` state

Each data file exports a single dictionary (e.g., `creatures`, `quests`, `lore`) where keys are snake_case identifiers and values are dictionaries with game object properties.

**Player state**: Managed in `MythicScribeApp.player_state` dict containing `name`, `gold`, `inventory`, and `current_location`.

## Key Patterns

### Textual TUI Framework
- Uses Textual's `App` class with `RichLog` for output and `Input` for commands
- CSS styling in `tui.css` (grid layout, border colors)
- Key bindings defined in `BINDINGS` class attribute (e.g., `q` for quit, `l` for look)
- Rich markup for formatting: `[bold green]text[/bold green]`, `[red]error[/red]`

### Command Processing
Commands handled in `on_input_submitted()`:
1. Normalize to lowercase
2. Apply aliases (`doc` → `document creature`, `inv` → `inventory`)
3. Match against command patterns with `if/elif` chain
4. Extract arguments via `.split()` for multi-word commands

Command history: ↑/↓ arrows navigate previous commands (stored in `self.command_history`)

### Flexible Input Matching
`find_match(input_name, data_dict)` supports:
1. Exact match on item `name` or dict key (case-insensitive)
2. Partial substring match
3. Word-based fuzzy match (all input words present in target)

Example: `"woods quest"` matches `first_quest` because both "woods" and "quest" appear in "The Whispering Woods".

### Location System
- Locations are hardcoded strings: `"scribe_office"`, `"whispering_woods"`
- `display_location_tui()` renders location-specific panels with ASCII art, descriptions, and contextual hints
- Navigation via `possible_destinations` nested dict mapping user input phrases to internal location keys

### Quest Completion Logic
`first_quest` ("The Whispering Woods") has special logic in `complete quest` command:
- Requires both `goblin` and `dire_wolf` to be documented before completion
- Other quests (if added) may use simpler completion checks

### State Mutations
Game state is directly mutated in command handlers:
- `creature["documented"] = True`
- `quest["status"] = "active"` or `"completed"`
- `lore_item["discovered"] = True`
- `player_state["gold"] += reward_amount`

No save/load system exists - state resets on restart.

## Adding Content

**New creature**: Add entry to `data/creatures.py` dict with keys: `name`, `description`, `danger_level`, `documented`, optional `ascii_art`.

**New quest**: Add entry to `data/quests.py` dict with keys: `name`, `description`, `reward`, `status` (usually `"available"`).

**New location**:
1. Add `elif` block in `display_location_tui()` with location art and descriptions
2. Update `possible_destinations` dict in `go` command handler
3. Consider adding location-specific quest/creature hints

**New lore**: Add entry to `data/lore.py` dict with keys: `title`, `text`, `discovered`, optional `ascii_art`.

## CSS Styling

`tui.css` uses Textual CSS:
- `#app-grid`: Grid layout with `1fr auto` rows (log fills space, input is auto-height)
- `#game-log`: Game output area with themed borders
- `#command-input`: User input field with accent border

Textual theme variables: `$panel`, `$surface`, `$accent`, `$text`

## CRUSH.md

A `CRUSH.md` file exists with overlapping information. When making architectural changes, update both files to stay consistent.
