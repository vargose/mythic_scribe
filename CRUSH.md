# CRUSH.md for Mythic Scribe

This document outlines essential information for agents working on the Mythic Scribe codebase.

## Project Type
Text-based adventure game written in Python.

## Code Organization and Structure

- **`main.py`**: The main entry point of the game. It contains the core game loop, command parsing, player state management, and location display logic.
- **`data/`**: This directory holds all game data.
    - **`data/creatures.py`**: Defines creature data, including their names, descriptions, danger levels, and documentation status.
    - **`data/lore.py`**: Defines lore entries, including titles, text, and discovery status.
    - **`data/quests.py`**: Defines quest data, including names, descriptions, rewards, and status.

## Essential Commands

The game is run directly using Python.

- **Run the game**:
    ```bash
    python main.py
    ```

## Code Patterns and Conventions

- **Data Storage**: Game data (creatures, lore, quests) is stored in Python dictionaries within separate `.py` files in the `data/` directory. Each dictionary uses snake_case keys (e.g., `goblin`, `ancient_ruins`, `first_quest`).
- **Player State**: The `player_state` dictionary in `main.py` manages the player's name, gold, inventory, and current location.
- **Command Handling**: Commands are processed in `main.py` within a `while True` loop, using `input()` for user input and `if/elif` statements for command parsing.
- **`find_match` function**: A helper function in `main.py` (`find_match(input_name, data_dict)`) is used to find matching items in data dictionaries, allowing for both exact and partial, case-insensitive matches based on item `name` or dictionary key.
- **Locations**: Game locations are managed by the `player_state["current_location"]` and described by the `display_location()` function. Possible transitions between locations are defined in `possible_destinations` dictionary in `main.py`.

## Testing Approach

There are no explicit test files or test frameworks observed in the codebase. Testing is currently manual by running `main.py` and interacting with the game.

## Gotchas and Non-obvious Patterns

- **Path Resolution**: `sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))` is used in `main.py` to allow absolute imports from the project root.
- **Quest Completion Logic**: The completion of "The Whispering Woods" quest (`first_quest`) specifically checks if both "goblin" and "dire_wolf" creatures are documented before allowing completion. Other quests might have simpler completion logic.
- **Flexible Input Matching**: The `find_match` function allows for flexible matching of user input against data keys and item names, supporting both exact and partial matches, and ignoring case.
- **Location Navigation**: The `go [destination]` command uses a `possible_destinations` dictionary to map user input (e.g., "whispering woods", "woods") to internal location keys (e.g., "whispering_woods").
