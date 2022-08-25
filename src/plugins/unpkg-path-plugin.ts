import esbuild, { OnResolveArgs } from 'esbuild-wasm'

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',

    // called when the plugin is initialized
    setup(build: esbuild.PluginBuild) {
      // Handle root entry file of 'index.js'
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return { path: 'index.js', namespace: 'a' }
      })

      // Handle relative paths in a module
      build.onResolve({ filter: /^\.+\// }, async (args: OnResolveArgs) => {
        return {
          namespace: 'a',
          path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`).href,
        }
      })

      // Handle main file of a module
      build.onResolve({ filter: /.*/ }, async (args: OnResolveArgs) => {
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        }
      })
    },
  }
}
