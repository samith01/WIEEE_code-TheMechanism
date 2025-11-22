import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Goals from './pages/goals'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}

export default App
