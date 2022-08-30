import * as esbuild from 'esbuild-wasm'
import { createRoot } from 'react-dom/client'
import { useState, useEffect, useRef } from 'react'
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin'
import { fetchPlugin } from './plugins/fetch-plugin'

const container = document.getElementById('root')
const root = createRoot(container!)

const App = () => {
  const [input, setInput] = useState('')
  const ref = useRef<any>()
  const iframe = useRef<any>()

  // initialize of the esbuild service
  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
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

    iframe.current.srcdoc = HTML

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

    iframe.current.contentWindow.postMessage(result.outputFiles[0].text, '*')
  }

  const HTML = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script>
        window.addEventListener('message', (event) => {
          try {
            eval(event.data)            
          } catch (error) {
            const root = document.querySelector('#root')
            root.innerHTML = '<div style="color: red"> <h4> Runtime Error </h4>' + error + '</div>'
            console.error(error)
          }
        }, false)
        </script>    
      </body>
    </html>
  `

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <iframe
        title='preview'
        sandbox='allow-scripts'
        ref={iframe}
        srcDoc={HTML}
      ></iframe>
    </div>
  )
}

export default App

root.render(<App />)
