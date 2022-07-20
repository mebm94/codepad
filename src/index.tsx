import { createRoot } from 'react-dom/client'
import { useState } from 'react'

const App = () => {
  const [input, setInput] = useState('')
  const [code, setCode] = useState('')

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
export default App

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<App />)
