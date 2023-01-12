import react from '@vitejs/plugin-react';
import glob from 'glob';
import { resolve } from 'path';
import path from 'path';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import packageJson from './package.dist.json';

// https://vitejs.dev/guide/build.html#library-mode
// https://onderonur.netlify.app/blog/creating-a-typescript-library-with-vite/
// https://medium.com/singapore-gds/how-to-support-subpath-imports-using-react-rollup-typescript-1d3d331f821b

// config for each submodule and root package.json
const subFolderJsonConfigs = glob.sync('./lib/**/', {}).map((folder) => {
  const distPath = folder.replace('./lib/', '');
  return {
    outputFolder: `./dist/${distPath}`,
    baseContents: distPath
      ? {
          name: `${packageJson.name}/${distPath.slice(0, -1)}`,
          module: './index.js', // --> points to esm format entry point of individual component
          types: './index.d.ts', // --> points to types definition file of individual component
          sideEffects: false,
        }
      : (packageJson as Required<
          Parameters<typeof generatePackageJson>
        >[0]['baseContents']),
  };
});

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
    minify: true,
    lib: {
      // include independent modules https://github.com/vitejs/vite/discussions/8098
      entry: glob.sync(path.resolve(__dirname, entriesMask)),
      fileName: (format, entryName) => `${entryName}.js`,
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
      ],
      plugins: [
        // generate package.json for each submodule and root
        ...subFolderJsonConfigs.map(generatePackageJson),
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
      ],
    }),
  ],
});
