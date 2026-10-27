import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Los paquetes del monorepo se publican como fuente TypeScript: se empaquetan dentro del build.
  noExternal: [/^@servicematch\//],
});
