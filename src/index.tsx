import { createRoot } from 'react-dom/client'

const App = () => {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
}
export default App

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<App />)
