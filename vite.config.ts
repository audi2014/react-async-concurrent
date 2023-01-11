import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  resolve: {
    // allow absolute path imports. see tsconfig.json compilerOptions.paths
    alias: [
      {
        find: 'lib',
        replacement: resolve(__dirname, './lib'),
      },
    ],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: '@audi2014/react-async-concurrent',
      fileName: 'main',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // exclude react from dist
      external: ['react'],
      output: {
        globals: {
          react: 'React',
        },
      },
    },
  },
  plugins: [
    // allow jsx/tsx:
    react({
      // exclude react/jsx-runtime (30kb+) from dist
      jsxRuntime: 'classic',
    }),
    // export types:
    dts({
      rollupTypes: true,
    }),
  ],
});
