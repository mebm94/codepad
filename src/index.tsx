import * as esbuild from 'esbuild-wasm'
import { createRoot } from 'react-dom/client'
import { useState, useEffect, useRef } from 'react'

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

    // transpile the input code to valid javascript code
    const result = await ref.current.transform(input, {
      loader: 'jsx',
      target: 'es2015',
    })
    setCode(result.code)
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
      <pre>{JSON.stringify(code, null, 2)}</pre>
    </div>
  )
}

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<App />)

export default App
