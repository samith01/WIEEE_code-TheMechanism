import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="logo">WIEEE CODE</h1>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">Project Page</Link>
      </div>
    </nav>
  )
}
