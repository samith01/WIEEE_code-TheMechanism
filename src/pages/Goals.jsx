import { useState, useEffect } from 'react'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [text, setText] = useState('')
  const [progress, setProgress] = useState('') // stores the original progress description

  // load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('goals')
      if (stored) setGoals(JSON.parse(stored))
    } catch (e) {
      setGoals([])
    }
  }, [])

  // persist to localStorage
  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals))
  }, [goals])

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = text.trim()
    const progDesc = progress.trim()
    if (!trimmed) return
    const newGoal = { id: Date.now(), text: trimmed, progress: progDesc }
    setGoals(prev => [newGoal, ...prev])
    setText('')
    setProgress('')
  }

  function handleDelete(id) {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  return (
    <div className="goals" style={{ maxWidth: 680, margin: '24px auto', padding: 16 }}>
      <h2>Your Goals</h2>
      <p>Set and track your goals here. Provide the goal and a short description of your starting progress (e.g., "ran 1km", "10 push-ups").</p>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
        <input
          aria-label="New goal"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="What is your goal?"
          style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <input
          aria-label="Starting progress description"
          value={progress}
          onChange={e => setProgress(e.target.value)}
          placeholder="Where are you starting?"
          type="text"
          style={{ width: 200, padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: '#1E90FF', color: '#fff' }}>
          Add
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 20, display: 'grid', gap: 10 }}>
        {goals.length === 0 && <li style={{ color: '#666' }}>No goals yet — add one above.</li>}
        {goals.map(goal => (
          <li key={goal.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 8, background: '#f7f7f7', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{goal.text}</strong>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: '#333', fontStyle: 'italic' }}>{goal.progress || 'No starting progress provided'}</span>
                <button
                  onClick={() => handleDelete(goal.id)}
                  aria-label={`Delete goal ${goal.text}`}
                  style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#ff4d4f', color: '#fff' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}