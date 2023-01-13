# Modern way to support subpath imports:

```json5
// package.dist.json
{
  "sideEffects": false,
  "type": "module",
  "module": "./index.js",
  "main": "./index.cjs",
  "types": "./index.d.ts",
  "exports": {
    ".": {
      "import": "./index.js",
      "require": "./index.cjs",
      "types": "./index.d.ts"
    },
    "./*": {
      "import": "./*/index.js",
      "require": "./*/index.cjs",
      "types": "./*/index.d.ts"
    }
  },
}
```
# Alternative way to support subpath imports:

https://medium.com/singapore-gds/how-to-support-subpath-imports-using-react-rollup-typescript-1d3d331f821b

generate package.json for each subfolder

```json5
// package.dist.json
{
  "sideEffects": false,
  "type": "module",
  "module": "./index.js",
  "main": "./index.cjs",
  "types": "./index.d.ts",
}
```

```ts
// vite.config.ts
// config for each submodule and root package.json
import generatePackageJson from 'rollup-plugin-generate-package-json';
import packageJson from './package.dist.json';
const subFolderJsonConfigs = glob.sync('./lib/**/', {}).map((folder) => {
  const distPath = folder.replace('./lib/', '');
  return {
    outputFolder: `./dist/${distPath}`,
    baseContents: distPath
      ? {
        name: `${packageJson.name}/${distPath.slice(0, -1)}`,
        main: packageJson.main, // support legacy node require api
        module: packageJson.module, // --> points to esm format entry point of individual component
        types: packageJson.types, // --> points to types definition file of individual component
        sideEffects: packageJson.sideEffects,
        // exports: packageJson.exports,
      }
      : (packageJson as Required<
        Parameters<typeof generatePackageJson>
        >[0]['baseContents']),
  };
});
// ...
export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        ...subFolderJsonConfigs.map(generatePackageJson)
      ]
    }
  }
})
```

install rollup-plugin-generate-package-json:

```json5
// package.json
{
  //...
  "devDependencies": {
    "@types/rollup-plugin-generate-package-json": "^3.2.0",
    "rollup-plugin-generate-package-json": "^3.2.0",
  },
  //...
  "pnpm": {
    "peerDependencyRules": {
      "ignoreMissing": [
        "rollup"
      ]
    }
  }
}
```
