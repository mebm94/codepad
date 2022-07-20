import * as esbuild from 'esbuild-wasm'
import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'

const App = () => {
  const [input, setInput] = useState('')
  const [code, setCode] = useState('')

  const startService = async () => {
    const service = await esbuild.startService({
      worker: true,
      wasmURL: './esbuild.wasm',
    })
    console.log('esbuild service object:>> ', service)
  }

  useEffect(() => {
    startService()
  }, [])

  const onClick = () => {
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
