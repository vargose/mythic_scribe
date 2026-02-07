import sys
import os

from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Input, RichLog
from textual.containers import Container
from rich.panel import Panel
from rich.columns import Columns

# All data imports and player_state will be handled within the App class now.

class MythicScribeApp(App):
    BINDINGS = [
        ("q", "quit", "Quit"),
        ("l", "look", "Look"),
        ("h", "help", "Help"),
        ("i", "inventory", "Inventory"),
        ("Q", "quests", "Quests"),
        ("C", "creatures", "Creatures"),
        ("L", "lore", "Lore"),
        ("t", "take quest", "Take Quest"),
        ("g", "go", "Go"),
        ("d", "document creature", "Document"),
    ]

    CSS_PATH = "tui.css"

    def __init__(self):
        super().__init__()
        from data.quests import quests
        from data.creatures import creatures
        from data.lore import lore

        self.quests = quests
        self.creatures = creatures
        self.lore = lore

        self.player_state = {
            "name": "Scribe",
            "gold": 100,
            "inventory": [],
            "current_location": "scribe_office"
        }
        
        # Command history for up/down arrow navigation
        self.command_history = []
        self.current_history_index = -1
    
    def find_match(self, input_name, data_dict):
        input_name_lower = input_name.lower()
        for key, item in data_dict.items():
            if input_name_lower == item["name"].lower() or input_name_lower == key.replace("_", " ").lower():
                return key, item
        # Allow partial matches if no exact match
        for key, item in data_dict.items():
            if input_name_lower in item["name"].lower() or input_name_lower in key.replace("_", " ").lower():
                return key, item
                
        # 3. Word-based fuzzy match (all words from input are present in target, order doesn't matter)
        input_words = input_name_lower.split()
        if input_words: # Only proceed if there are words to match
            for key, item in data_dict.items():
                target_name_lower = item["name"].lower()
                target_key_lower = key.replace("_", " ").lower()
                
                # Check if all input words are in target name
                all_words_in_name = all(word in target_name_lower for word in input_words)
                if all_words_in_name:
                    return key, item
                
                # Check if all input words are in target key
                all_words_in_key = all(word in target_key_lower for word in input_words)
                if all_words_in_key:
                    return key, item
                    
        return None, None

    def compose(self) -> ComposeResult:
        yield Header()
        with Container(id="app-grid"):
            yield RichLog(id="game-log")
            yield Input(placeholder="Enter your command here... (↑/↓ for history)", id="command-input")
        yield Footer()

    def on_mount(self) -> None:
        self.query_one("#game-log").write("Welcome, Scribe, to the World of Eldoria!")
        self.query_one("#game-log").write("Your task is to document the creatures and lore of this land.")
        self.query_one("#game-log").write("Choose your path wisely, for danger lurks in the shadows.")
        self.query_one("#game-log").write("Type [bold green]help[/bold green] for a list of commands, or [bold cyan]h[/bold cyan] for quick help.")
        self.display_location_tui()

    def display_location_tui(self):
        current_location_key = self.player_state["current_location"]
        log = self.query_one("#game-log")
        
        if current_location_key == "scribe_office":
            location_art = """
  /---\\
 |  _  |
 | | | |
 | |_| |
 \\_____/
  Scribe's Office
"""
            title_panel = Panel("[bold blue]Scribe\'s Office[/bold blue]", expand=False)
            art_panel = Panel(location_art, expand=False)
            description = "You are in your cozy office, surrounded by scrolls and maps. The scent of old parchment fills the air."
            exits = "From here, you can venture into the '[bold magenta]Whispering Woods[/bold magenta]'."
            
            content = [title_panel, art_panel, description, exits]

            if self.quests["first_quest"]["status"] == "available":
                content.append("A parchment on your desk details '[bold yellow]The Whispering Woods[/bold yellow]' quest. Perhaps you should 'take quest The Whispering Woods' or just 'take woods quest'.")
            elif self.quests["first_quest"]["status"] == "completed":
                content.append("You have completed '[bold yellow]The Whispering Woods[/bold yellow]' quest. New quests may appear soon.")
            
            log.write(Columns(content))

        elif current_location_key == "whispering_woods":
            location_art = """
   /\\_/\\\n  / _ \\ \\\n ( / \\ | )\n  \\ \\_/ /\n   \\___/\n  Whispering Woods
"""
            title_panel = Panel("[bold blue]Whispering Woods[/bold blue]", expand=False)
            art_panel = Panel(location_art, expand=False)
            description = "You are in the Whispering Woods. Tall, ancient trees loom over you, their leaves rustling with unseen secrets."
            exits = "You can see a path leading '[bold magenta]back[/bold magenta]' to the Scribe's Office."

            content = [title_panel, art_panel, description, exits]

            if self.quests["first_quest"]["status"] == "active":
                content.append("You are currently on '[bold yellow]The Whispering Woods[/bold yellow]' quest.")
                undocumented_found = False
                if not self.creatures["goblin"]["documented"]:
                    content.append("You sense small, scuttling creatures nearby. Perhaps you should '[bold green]document goblin[/bold green]'.")
                    undocumented_found = True
                if not self.creatures["dire_wolf"]["documented"]:
                    content.append("A low growl echoes through the trees. You might want to '[bold green]document dire wolf[/bold green]'.")
                    undocumented_found = True
                if not undocumented_found:
                    content.append("You have documented all known creatures here. Perhaps it\'s time to \'[bold green]complete woods quest[/bold green]\'.")
            
            log.write(Columns(content))

        else:
            log.write(Panel("[bold red]Unknown Location[/bold red]", expand=False))
            log.write("You find yourself in a place unknown.")

    def add_to_history(self, command):
        """Add a command to history if it's not empty and different from the last one"""
        command = command.strip()
        if command and (not self.command_history or self.command_history[-1] != command):
            self.command_history.append(command)
            self.current_history_index = len(self.command_history)

    def get_previous_command(self):
        """Get the previous command in history"""
        if self.command_history and self.current_history_index > 0:
            self.current_history_index -= 1
            return self.command_history[self.current_history_index]
        return ""

    def get_next_command(self):
        """Get the next command in history"""
        if self.command_history and self.current_history_index < len(self.command_history) - 1:
            self.current_history_index += 1
            return self.command_history[self.current_history_index]
        elif self.command_history and self.current_history_index == len(self.command_history) - 1:
            # Clear input when going past the last command
            self.current_history_index = len(self.command_history)
            return ""
        return ""

    def action_take_quest(self) -> None:
        """Handle 't' key binding to suggest taking a quest"""
        log = self.query_one("#game-log")
        log.write("> [dim](Key binding: take quest)[/dim]")
        available_quests = [q for q in self.quests.values() if q["status"] == "available"]
        if available_quests:
            log.write(f"Available quest: [bold yellow]{available_quests[0]['name']}[/bold yellow]. Try '[bold green]take quest {available_quests[0]['name']}[/bold green]'")
        else:
            log.write("No available quests at the moment.")

    def action_go(self) -> None:
        """Handle 'g' key binding to suggest going somewhere"""
        log = self.query_one("#game-log")
        log.write("> [dim](Key binding: go)[/dim]")
        if self.player_state["current_location"] == "scribe_office":
            log.write("You can go to the [bold magenta]Whispering Woods[/bold magenta]. Try '[bold green]go woods[/bold green]'")
        else:
            log.write("You can go [bold magenta]back[/bold magenta] to the Scribe's Office. Try '[bold green]go back[/bold green]'")

    def action_document_creature(self) -> None:
        """Handle 'd' key binding to suggest documenting a creature"""
        log = self.query_one("#game-log")
        log.write("> [dim](Key binding: document creature)[/dim]")
        if self.player_state["current_location"] == "whispering_woods" and self.quests["first_quest"]["status"] == "active":
            undocumented = [c for c in self.creatures.values() if not c["documented"]]
            if undocumented:
                log.write(f"You can document: [bold green]{undocumented[0]['name']}[/bold green]. Try '[bold green]document creature {undocumented[0]['name'].lower()}[/bold green]'")
        else:
            log.write("No obvious creatures to document here. Try '[bold green]creatures[/bold green]' to see what you've found.")

    def on_input_submitted(self, event: Input.Submitted) -> None:
        command = event.value.lower().strip()
        event.input.value = ""  # Clear the input
        log = self.query_one("#game-log")
        log.write(f"> {command}")

        # Add to command history
        self.add_to_history(command)

        # Common aliases/shorthands
        if command == "doc":
            command = "document creature"
        elif command == "quest":
            command = "quests"
        elif command == "creat":
            command = "creatures"
        elif command == "inv":
            command = "inventory"

        if command == "quit" or command == "exit":
            self.exit("Farewell, Scribe.")
        elif command == "look":
            self.display_location_tui()
        elif command == "quests":
            log.write("\n--- Quests ---")
            for key, quest in self.quests.items():
                status = quest["status"]
                log.write(f"- {quest["name"]} ([bold green]{status}[/bold green])")
        elif command.startswith("take quest "):
            quest_input = command.split("take quest ", 1)[1].strip()
            quest_key, quest = self.find_match(quest_input, self.quests)

            if quest:
                if quest["status"] == "available":
                    quest["status"] = "active"
                    log.write(f"You have taken the quest: [bold yellow]{quest["name"]}[/bold yellow].")
                elif quest["status"] == "active":
                    log.write(f"You are already on the quest: [bold yellow]{quest["name"]}[/bold yellow].")
                else:
                    log.write(f"The quest [bold yellow]{quest["name"]}[/bold yellow] is already {quest["status"]}.")
            else:
                log.write(f"[red]Quest \'{quest_input}\' not found.[/red]")
        elif command.startswith("document creature "):
            creature_input = command.split("document creature ", 1)[1].strip()
            creature_key, creature = self.find_match(creature_input, self.creatures)

            if creature:
                if not creature["documented"]:
                    creature["documented"] = True
                    log.write(f"You have documented the [bold blue]{creature["name"]}[/bold blue].")
                    if "ascii_art" in creature:
                        log.write(Panel(creature["ascii_art"], expand=False))
                else:
                    log.write(f"The [bold blue]{creature["name"]}[/bold blue] is already documented.")
            else:
                log.write(f"[red]Creature \'{creature_input}\' not found.[/red]")
        elif command.startswith("complete quest "):
            quest_input = command.split("complete quest ", 1)[1].strip()
            quest_key, quest = self.find_match(quest_input, self.quests)

            if quest:
                if quest["status"] == "active":
                    if quest_key == "first_quest":
                        if self.creatures["goblin"]["documented"] and self.creatures["dire_wolf"]["documented"]:
                            quest["status"] = "completed"
                            self.player_state["gold"] += int(quest["reward"].split()[0])
                            log.write(f"You have completed the quest: [bold yellow]{quest["name"]}[/bold yellow]. You received [bold green]{quest["reward"]}[/bold green].")
                        else:
                            log.write(f"[red]You must document all creatures for \'The Whispering Woods\' before completing it.[/red]")
                    else:
                        quest["status"] = "completed"
                        self.player_state["gold"] += int(quest["reward"].split()[0])
                        log.write(f"You have completed the quest: [bold yellow]{quest["name"]}[/bold yellow]. You received [bold green]{quest["reward"]}[/bold green].")
                elif quest["status"] == "completed":
                    log.write(f"The quest [bold yellow]{quest["name"]}[/bold yellow] is already completed.")
                else:
                    log.write(f"The quest [bold yellow]{quest["name"]}[/bold yellow] is not active.")
            else:
                log.write(f"[red]Quest \'{quest_input}\' not found.[/red]")
        elif command == "creatures":
            log.write("\n--- Documented Creatures ---")
            for key, creature in self.creatures.items():
                if creature["documented"]:
                    log.write(f"- [bold blue]{creature["name"]}[/bold blue]: {creature["description"]}")
                    if "ascii_art" in creature:
                        log.write(Panel(creature["ascii_art"], expand=False))
                else:
                    log.write(f"- [bold blue]{creature["name"]}[/bold blue]: [italic red]Undocumented[/italic red]")
        elif command == "lore":
            log.write("\n--- Discovered Lore ---")
            for key, lore_item in self.lore.items():
                if lore_item["discovered"]:
                    log.write(f"- [bold magenta]{lore_item["title"]}[/bold magenta]: {lore_item["text"]}")
                    if "ascii_art" in lore_item:
                        log.write(Panel(lore_item["ascii_art"], expand=False))
                else:
                    log.write(f"- [bold magenta]{lore_item["title"]}[/bold magenta]: [italic red]Undiscovered[/italic red]")
        elif command == "inventory":
            log.write("\n--- Inventory ---")
            if self.player_state["inventory"]:
                for item in self.player_state["inventory"]:
                    log.write(f"- {item}")
            else:
                log.write("Your inventory is empty.")
            log.write(f"Gold: [bold yellow]{self.player_state["gold"]}[/bold yellow]")
        elif command.startswith("go "):
            destination = command.split("go ", 1)[1].strip()
            current_location = self.player_state["current_location"]

            # Define possible destinations for each location with flexible names
            possible_destinations = {
                "scribe_office": {
                    "whispering woods": "whispering_woods",
                    "woods": "whispering_woods"
                },
                "whispering_woods": {
                    "back": "scribe_office",
                    "scribe office": "scribe_office",
                    "office": "scribe_office"
                }
            }

            destination_map = possible_destinations.get(current_location, {})
            matched_destination = None
            for key_phrase, actual_location in destination_map.items():
                if destination.lower() == key_phrase.lower() or destination.lower() in key_phrase.lower():
                    matched_destination = actual_location
                    break
            
            if matched_destination:
                self.player_state["current_location"] = matched_destination
                self.display_location_tui()
            else:
                log.write("[red]You cannot go that way from here.[/red]")
        elif command == "help":
            log.write("\n--- Available Commands ---")
            log.write("  [bold green]look[/bold green]: Describes your current location.")
            log.write("  [bold green]quests[/bold green]: Lists all quests and their status.")
            log.write("  [bold green]take quest [quest name][/bold green]: Attempts to take an available quest.")
            log.write("  [bold green]complete quest [quest name][/bold green]: Attempts to complete an active quest.")
            log.write("  [bold green]document creature [creature name][/bold green]: Attempts to document a creature in your current location.")
            log.write("  [bold green]creatures[/bold green]: Shows documented and undocumented creatures.")
            log.write("  [bold green]lore[/bold green]: Shows discovered and undiscovered lore entries.")
            log.write("  [bold green]inventory[/bold green]: Displays your gold and items.")
            log.write("  [bold green]go [destination][/bold green]: Moves you to a new location.")
            log.write("  [bold green]quit/exit[/bold green]: Exits the game.")
            log.write("\n--- Shortcuts ---")
            log.write("  [bold cyan]↑/↓[/bold cyan]: Navigate command history")
            log.write("  [bold cyan]h[/bold cyan]: Show this help")
            log.write("  [bold cyan]q[/bold cyan]: Quit")
            log.write("  [bold cyan]l[/bold cyan]: Look around")
            log.write("  [bold cyan]i[/bold cyan]: Inventory")
            log.write("  [bold cyan]Q[/bold cyan]: Quests")
            log.write("  [bold cyan]C[/bold cyan]: Creatures")
            log.write("  [bold cyan]L[/bold cyan]: Lore")
            log.write("  [bold cyan]t[/bold cyan]: Take a quest")
            log.write("  [bold cyan]g[/bold cyan]: Go somewhere")
            log.write("  [bold cyan]d[/bold cyan]: Document a creature")
        else:
            # Improved error message with suggestions
            log.write("[red]Unknown command. Type \'help\' for a list of commands.[/red]")
            
            # Common command corrections
            suggestions = []
            if "goblin" in command or "wolf" in command:
                suggestions.append("Did you mean 'document creature goblin'?")
            elif "wood" in command:
                suggestions.append("Did you mean 'go woods' or 'take quest The Whispering Woods'?")
            elif "quest" in command:
                suggestions.append("Did you mean 'quests' or 'take quest [name]'?")
            elif "creat" in command:
                suggestions.append("Did you mean 'creatures'?")
            elif "doc" in command:
                suggestions.append("Did you mean 'document creature [name]'?")
            elif "inv" in command or "inven" in command:
                suggestions.append("Did you mean 'inventory'?")
            
            if suggestions:
                for suggestion in suggestions:
                    log.write(f"[yellow]{suggestion}[/yellow]")

    def action_quit(self) -> None:
        self.exit("Farewell, Scribe.")

if __name__ == "__main__":
    app = MythicScribeApp()
    app.run()