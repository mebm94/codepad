import * as esbuild from 'esbuild-wasm'
import axios from 'axios'

export const unpkgPathPlugin = () => {
  return {
    // name of the plugin
    name: 'unpkg-path-plugin',

    // called when the plugin is initialized
    setup(build: esbuild.PluginBuild) {
      // figure out where the 'index.js' file is located
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResolve', args)

        if (args.path === 'index.js') {
          return { path: args.path, namespace: 'a' }
        } else if (args.path === 'tiny-test-pkg') {
          return {
            path: 'https://unpkg.com/tiny-test-pkg@1.0.0/index.js',
            namespace: 'a',
          }
        }
      })

      // attempt to load the 'index.js' file from the unpkg path
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args)

        // hardcoded contents value of the file to be bundled
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: `
              import message from 'tiny-test-pkg';
              console.log(message);
            `,
          }
        }
        const { data } = await axios.get(args.path)
        return {
          loader: 'jsx',
          contents: data,
        }
      })
    },
  }
}
