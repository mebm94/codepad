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
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: 'jsx',
          contents: inputCode,
        }
      })

      build.onLoad({ filter: /.*/ }, async (args: OnLoadArgs) => {
        // if the package is already cached return
        const cachedResult = await fileCache.getItem<OnLoadResult>(args.path)

        if (cachedResult) {
          return cachedResult
        }
      })

      // attempt to load (fetch) any css package file from the unpkg path
      build.onLoad({ filter: /.css$/ }, async (args: OnLoadArgs) => {
        const { data, request } = await axios.get(args.path)
        const escaped = data
          .replace(/\n/g, '')
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'")

        const contents = `
            const style = document.createElement('style')
            style.innerText = '${escaped}'
            document.head.appendChild(style)
            `

        const result: OnLoadResult = {
          loader: 'jsx',
          contents: contents,
          resolveDir: new URL('./', request.responseURL).pathname,
        }

        // store response in fileCache
        fileCache.setItem(args.path, result)
        return result
      })

      build.onLoad({ filter: /.*/ }, async (args: OnLoadArgs) => {
        const { data, request } = await axios.get(args.path)
        const result: OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        }

        fileCache.setItem(args.path, result)
        return result
      })
    },
  }
}
