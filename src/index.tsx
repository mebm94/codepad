import * as esbuild from 'esbuild-wasm'
import { createRoot } from 'react-dom/client'
import { useState, useEffect, useRef } from 'react'
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin'
import { fetchPlugin } from './plugins/fetch-plugin'

const container = document.getElementById('root')
const root = createRoot(container!)

const App = () => {
  const [input, setInput] = useState('')
  const [code, setCode] = useState('')
  const ref = useRef<any>()

  // initialize of the esbuild service
  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: './esbuild.wasm',
    })
  }

  // call the startService function when the component is first rendered
  useEffect(() => {
    startService()
  }, [])

  const onClick = async () => {
    if (!ref.current) {
      return
    }

    // tell esbuild to parse and bundle the input code to valid javascript code
    const result = await ref.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
    })

    setCode(result.outputFiles[0].text)
  }

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <pre>{code}</pre>
    </div>
  )
}

export default App

root.render(<App />)
