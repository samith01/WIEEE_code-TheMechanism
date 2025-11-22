import { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("");
  const [error, setError] = useState("");

  // Load existing goals
  useEffect(() => {
    try {
      const stored = localStorage.getItem("goals");
      if (stored) setGoals(JSON.parse(stored));
    } catch {
      setGoals([]);
    }
  }, []);

  // Save changes to goals
  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  function handleAdd(e) {
    e.preventDefault();
    const trimmed = text.trim();
    const progDesc = progress.trim();
    if (!trimmed) return;

    setGoals((prev) => [
      { id: Date.now(), text: trimmed, progress: progDesc },
      ...prev,
    ]);

    setText("");
    setProgress("");
  }

  function handleDelete(id) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  async function handleGeneratePlan() {
    setLoading(true);
    setError("");
    setPlan("");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Generate me a plan to reach this goal",
    });
      setPlan(response.candidates[0].content.parts[0].text);
    } catch (err) {
      console.error(err);
      setError("Could not generate plan — check server logs.");
    }

    setLoading(false);
  }

  return (
    <div
      className="goals"
      style={{ maxWidth: 680, margin: "24px auto", padding: 16 }}
    >
      <h2>Your Goals</h2>

      <p>
        Set and track your goals here. Provide the goal and a short description
        of your starting progress (e.g., "ran 1km", "10 push-ups").
      </p>

      {/* Add Goal Form */}
      <form
        onSubmit={handleAdd}
        style={{
          display: "flex",
          gap: 8,
          marginTop: 16,
          alignItems: "center",
        }}
      >
        <input
          aria-label="New goal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new goal..."
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        <input
          aria-label="Starting progress"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          placeholder="Starting progress"
          style={{
            width: 200,
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            background: "#1E90FF",
            color: "#fff",
          }}
        >
          Add
        </button>
      </form>

      {/* Goals List */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          marginTop: 20,
          display: "grid",
          gap: 10,
        }}
      >
        {goals.length === 0 && (
          <li style={{ color: "#666" }}>No goals yet — add one above.</li>
        )}

        {goals.map((goal) => (
          <li
            key={goal.id}
            style={{
              padding: 12,
              borderRadius: 8,
              background: "#f7f7f7",
              border: "1px solid #eee",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>{goal.text}</strong>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  style={{ color: "#333", fontStyle: "italic", fontSize: 14 }}
                >
                  {goal.progress || "No progress"}
                </span>

                <button
                  onClick={() => handleDelete(goal.id)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "none",
                    background: "#ff4d4f",
                    color: "#fff",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Generate Plan Button */}
      {goals.length > 0 && (
        <button
          onClick={handleGeneratePlan}
          disabled={loading}
          style={{
            marginTop: 24,
            width: "100%",
            padding: "12px",
            fontSize: 16,
            borderRadius: 8,
            background: "#4caf50",
            color: "white",
            border: "none",
          }}
        >
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      )}

      {/* Error message */}
      {error && (
        <p style={{ color: "red", marginTop: 16, whiteSpace: "pre-wrap" }}>
          {error}
        </p>
      )}

      {/* Generated Plan Display */}
      {plan && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#fafafa",
            borderRadius: 8,
            border: "1px solid #ddd",
            whiteSpace: "pre-wrap",
          }}
        >
          <h3>Your AI-Generated Plan</h3>
          <p style={{ marginTop: 12 }}>{plan}</p>
        </div>
      )}
    </div>
  );
}
