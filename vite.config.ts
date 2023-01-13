import react from '@vitejs/plugin-react';
import glob from 'glob';
import { resolve } from 'path';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/guide/build.html#library-mode
// https://onderonur.netlify.app/blog/creating-a-typescript-library-with-vite/

const entriesMask = 'lib/**/*.{ts,tsx}';

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
    minify: false,
    lib: {
      // include independent modules https://github.com/vitejs/vite/discussions/8098
      entry: glob.sync(path.resolve(__dirname, entriesMask)),
      // esm - default format. cjs - for node require api (single bundle)
      fileName: (format, entryName) => `${entryName}.${format === 'esm' ? 'js' : format}`,
    },
    rollupOptions: {
      // exclude react from dist:
      external: ['react'],
      output: [
        {
          // Keep directory structure and files:
          preserveModules: true,
          sourcemap: true,
          // link *.js.map files to copied lib files. see viteStaticCopy
          sourcemapPathTransform: (relativeSourcePath) => {
            return `./${relativeSourcePath.split('/').pop()}`;
          },
          // sources already linked in map files. no reason to include sources as strings
          sourcemapExcludeSources: true,
          format: 'esm',
          globals: {
            react: 'React',
          },
        },
        // support legacy node require api
        {
          preserveModules: true,
          format: 'cjs',
          globals: {
            react: 'React',
          },
        },
      ],
    },
  },
  plugins: [
    // allow jsx/tsx:
    react({
      // exclude react/jsx-runtime (30kb+) from dist
      jsxRuntime: 'classic',
    }),
    // export types:
    // rollupTypes - put all types into one file
    dts(),
    // copy sources to dist
    viteStaticCopy({
      flatten: false,
      targets: [
        {
          // path of sources which will be copied to dist
          src: glob.sync(entriesMask),
          dest: './',
        },
        {
          src: ['./README.md', 'LICENSE'],
          dest: './',
        },
        {
          // set package.json for npm
          // https://webpack.js.org/guides/package-exports/
          src: './package.dist.json',
          dest: './',
          rename: 'package.json',
        },
      ],
    }),
  ],
});
