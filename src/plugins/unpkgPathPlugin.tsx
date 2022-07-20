import * as esbuild from 'esbuild-wasm'

export const unpkgPathPlugin = () => {
  return {
    // name of the plugin
    name: 'unpkg-path-plugin',

    // called when the plugin is initialized
    setup(build: esbuild.PluginBuild) {
      // figure out where the 'index.js' file is located
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResolve', args)

        return { path: args.path, namespace: 'a' }
      })

      // attempt to load the 'index.js' file from the unpkg path
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args)

        // hardcoded contents value of the file to be bundled
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: `
              import message from './message';
              console.log(message);
            `,
          }
        } else {
          return {
            loader: 'jsx',
            contents: 'export default "hi there!"',
          }
        }
      })
    },
  }
}
