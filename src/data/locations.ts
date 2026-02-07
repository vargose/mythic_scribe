import { Location, DestinationMap, LocationKey } from '../game/types.js';

/**
 * Location data - pure declarative data, no executable code
 * Safe to load from JSON or external sources
 */
export const locations: Record<LocationKey, Location> = {
  scribe_office: {
    key: 'scribe_office',
    name: "Scribe's Office",
    description: "You are in your cozy office, surrounded by scrolls and maps. The scent of old parchment fills the air.",
    ascii_art: `
  /---\\
 |  _  |
 | | | |
 | |_| |
 \\_____/
  Scribe's Office
`,
    exits: "From here, you can venture into the 'Whispering Woods'.",
    hints: [
      {
        questStatus: { quest: 'first_quest', status: 'available' },
        message: "A parchment on your desk details 'The Whispering Woods' quest. Perhaps you should 'take quest woods'."
      },
      {
        questStatus: { quest: 'first_quest', status: 'completed' },
        message: "You have completed 'The Whispering Woods' quest. New quests may appear soon."
      }
    ]
  },
  whispering_woods: {
    key: 'whispering_woods',
    name: 'Whispering Woods',
    description: 'You are in the Whispering Woods. Tall, ancient trees loom over you, their leaves rustling with unseen secrets.',
    ascii_art: `
   /\\_/\\
  / _ \\ \\
 ( / \\ | )
  \\ \\_/ /
   \\___/
  Whispering Woods
`,
    exits: "You can see a path leading 'back' to the Scribe's Office.",
    hints: [
      {
        questStatus: { quest: 'first_quest', status: 'active' },
        message: "You are currently on 'The Whispering Woods' quest."
      },
      {
        questStatus: { quest: 'first_quest', status: 'active' },
        creatureDocumented: { creature: 'goblin', documented: false },
        message: "You sense small, scuttling creatures nearby. Perhaps you should 'document goblin'."
      },
      {
        questStatus: { quest: 'first_quest', status: 'active' },
        creatureDocumented: { creature: 'dire_wolf', documented: false },
        message: "A low growl echoes through the trees. You might want to 'document dire wolf'."
      },
      {
        questStatus: { quest: 'first_quest', status: 'active' },
        allCreaturesDocumented: { creatures: ['goblin', 'dire_wolf'] },
        message: "You have documented all known creatures here. Perhaps it's time to 'complete quest woods'."
      }
    ]
  }
};

/**
 * Navigation rules - maps user input phrases to destination locations
 */
export const possibleDestinations: DestinationMap = {
  scribe_office: {
    'whispering woods': 'whispering_woods',
    'woods': 'whispering_woods'
  },
  whispering_woods: {
    'back': 'scribe_office',
    'scribe office': 'scribe_office',
    'office': 'scribe_office'
  }
};
