import * as esbuild from 'esbuild-wasm'
import axios from 'axios'

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',

    // called when the plugin is initialized
    setup(build: esbuild.PluginBuild) {
      // figure out where the 'index.js' file is located (path that we want to make the request to)
      build.onResolve({ filter: /.*/ }, async (args: any) => {
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
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args)

        // hardcoded contents value of the file to be bundled
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: `
              import React, { useState } from 'react-select';
              console.log(React, useState);
            `,
          }
        }
        const { data, request } = await axios.get(args.path)
        return {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        }
      })
    },
  }
}
