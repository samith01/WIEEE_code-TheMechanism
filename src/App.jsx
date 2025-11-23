import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Goals from './pages/goals'
import Authentication from './pages/Authentication'
import Navbar from './components/Navbar'
import Authentication from './pages/Authentication'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/about" element={<About />} />
        <Route path="/authentication" element={<Authentication />} />
      </Routes>
    </div>
  )
}

export default App
