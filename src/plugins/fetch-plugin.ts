import esbuild, { OnLoadArgs, OnLoadResult } from 'esbuild-wasm'
import axios from 'axios'
import localForage from 'localforage'

// create Object to interact with IndexedDB using localForage
const fileCache = localForage.createInstance({
  name: 'file_cache',
})
export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetch-plugin',

    setup(build: esbuild.PluginBuild) {
      // attempt to load (fetch) the 'index.js' file from the unpkg path
      build.onLoad({ filter: /.*/ }, async (args: OnLoadArgs) => {
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
