import { defineConfig } from 'vitest/config';

// Los tests son de lógica pura (src/dominio/, src/utils/, src/tema/): corren en Node, sin React Native.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
