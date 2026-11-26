import { defineConfig } from 'vitest/config';

// Los tests son de lógica pura (src/dominio/, src/utils/, src/tema/): corren en Node, sin React Native.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // D3: el año se calcula en la hora local. Se fija una zona sin horario de verano (UTC−5) para que
    // los tests den lo mismo en cualquier máquina (spec 01 §5).
    env: { TZ: 'America/Guayaquil' },
  },
});
