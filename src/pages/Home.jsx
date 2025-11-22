import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home">
      <section className="hero">
        <h2>Welcome to <span className="highlight">WIEEE Code</span></h2>
        <p>
          Kickstart your project using this React template.
          Customize it with your own idea, theme, and creativity!
        </p>
        <button onClick={() => navigate('/about')}>Go to Project Page</button>
      </section>
    </div>
  )
}
