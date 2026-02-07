import { Creature } from '../game/types.js';

export const creatures: Record<string, Creature> = {
  goblin: {
    name: 'Goblin',
    description: 'A small, green-skinned humanoid, often found in caves.',
    danger_level: 'low',
    documented: false,
    ascii_art: `
.---.
/    \\
| O  O |
 \\  -- /
  \`--'
  Goblin
`
  },
  dire_wolf: {
    name: 'Dire Wolf',
    description: 'A large, ferocious wolf known for its cunning and strength.',
    danger_level: 'medium',
    documented: false,
    ascii_art: `
  /\\_/\\
 ( o.o )
  > ^ <
 /     \\
/  / \\  \\
(_/   \\_)
 Dire Wolf
`
  }
};
