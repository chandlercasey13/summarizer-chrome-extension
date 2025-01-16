import React from "react";

import { useState } from 'react'


import './styles/App.css'
import './styles/index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img  className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img  className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="bg-red-400">
        <button onClick={() => setCount((count) => count + 1)}>
           {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      
    </>
  )
}

export default App
