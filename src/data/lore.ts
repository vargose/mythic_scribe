import { Lore } from '../game/types.js';

export const lore: Record<string, Lore> = {
  ancient_ruins: {
    title: 'The Ancient Ruins of Xylos',
    text: 'Whispers tell of an ancient civilization that once thrived in the heart of the Eldorian forests. Their ruins are said to hold powerful artifacts and forgotten knowledge.',
    discovered: false,
    ascii_art: `
 _   _
/ \\ / \\
|   |   |
 \\_/ \\_/
 Ancient Ruins
`
  },
  the_eldor_tree: {
    title: 'The Eldor Tree',
    text: 'The Eldor Tree is believed to be the source of all magic in Eldoria, its roots reaching deep into the earth and its branches touching the heavens.',
    discovered: false,
    ascii_art: `
   /\\
  /  \\
 /____\\
|      |
|      |
--------
 Eldor Tree
`
  }
};
