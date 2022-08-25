import esbuild, { OnLoadArgs, OnLoadResult, OnResolveArgs } from 'esbuild-wasm'
import axios from 'axios'
import localForage from 'localforage'

// create Object to interact with IndexedDB using localForage
const fileCache = localForage.createInstance({
  name: 'file_cache',
})

export const unpkgPathPlugin = (inputCode: string) => {
  return {
    name: 'unpkg-path-plugin',

    // called when the plugin is initialized
    setup(build: esbuild.PluginBuild) {
      // figure out where the 'index.js' file is located (path that we want to make the request to)
      build.onResolve({ filter: /.*/ }, async (args: OnResolveArgs) => {
        console.log('onResolve', args)

        if (args.path === 'index.js') {
          return { path: args.path, namespace: 'a' }
        }

        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            namespace: 'a',
            path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`)
              .href,
          }
        }

        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        }
      })

      // attempt to load (fetch) the 'index.js' file from the unpkg path
      build.onLoad({ filter: /.*/ }, async (args: OnLoadArgs) => {
        console.log('onLoad', args)

        // hardcoded contents value of the file to be bundled
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: inputCode,
          }
        }

        // Check to see if we have already fetched this file
        // and if it is in the fileCache
        const cachedResult = await fileCache.getItem<OnLoadResult>(args.path)

        if (cachedResult) {
          return cachedResult
        }

        const { data, request } = await axios.get(args.path)

        const result: OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        }

        // store response in fileCache
        fileCache.setItem(args.path, result)
        return result
      })
    },
  }
}
