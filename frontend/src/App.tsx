import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './sections/Home'
import Rag from './sections/Rag'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/rag' element={<Rag />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
