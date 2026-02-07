import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/index.tsx',
        'src/components/**/*.tsx',
        'src/game/types.ts'
      ],
      thresholds: {
        lines: 89,
        branches: 89,
        functions: 89,
        statements: 89
      }
    }
  }
});
