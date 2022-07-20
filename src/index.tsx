import * as esbuild from 'esbuild-wasm'
import { createRoot } from 'react-dom/client'
import { useState, useEffect, useRef } from 'react'

const App = () => {
  const [input, setInput] = useState('')
  const [code, setCode] = useState('')
  const ref = useRef<any>()

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: './esbuild.wasm',
    })
  }

  useEffect(() => {
    startService()
  }, [])

  const onClick = () => {
    if (!ref.current) {
      return
    }
    console.log('ref.current :>> ', ref.current)
    setCode(input)
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
