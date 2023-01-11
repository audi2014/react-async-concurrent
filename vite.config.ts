import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/guide/build.html#library-mode
// https://onderonur.netlify.app/blog/creating-a-typescript-library-with-vite/
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
      formats: ['cjs'],
      fileName: (format) => `main.${format}.js`,
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
