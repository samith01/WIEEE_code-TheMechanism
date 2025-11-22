// server.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
// fallback to .vscode/.env if root .env didn't provide keys (dev only)
if (
  !process.env.GOOGLE_API_KEY &&
  !process.env.API_KEY &&
  process.env.NODE_ENV !== "production"
) {
  dotenv.config({ path: path.join(process.cwd(), ".vscode", ".env") });
}

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.GOOGLE_API_KEY || process.env.API_KEY || undefined;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

console.log("Starting generatePlan server");
console.log("Model:", MODEL);
console.log("API key present:", !!API_KEY);
console.log(
  "Using .vscode/.env fallback:",
  !!process.env.API_KEY && !process.env.GOOGLE_API_KEY
);
console.log(
  "Using ADC (GOOGLE_APPLICATION_CREDENTIALS):",
  !!process.env.GOOGLE_APPLICATION_CREDENTIALS
);

// Initialize SDK. If no API_KEY provided, SDK will try ADC (service account JSON)
let ai = null;
try {
  ai = new GoogleGenAI({
    apiKey: API_KEY, // undefined allowed (use ADC)
  });
  console.log("GoogleGenAI initialized");
} catch (e) {
  console.warn(
    "GoogleGenAI init failed (will use mock fallback). Error:",
    e?.message || e
  );
  ai = null;
}

// deterministic fallback for dev when credentials fail or SDK missing
function generateMockPlan(goals) {
  const lines = [
    "MOCK PLAN (no Gemini credentials detected or call failed). Replace with real credentials to use Gemini.",
    "",
  ];
  goals.forEach((g, i) => {
    lines.push(`${i + 1}. Goal: ${g.text}`);
    lines.push(`   Starting progress: ${g.progress || "not provided"}`);
    lines.push(`   Objective: Make steady weekly improvements toward the target.`);
    lines.push(
      `   Weekly milestones: Week 1 - baseline & technique; Week 2 - +10% workload; Week 3 - consolidate; Week 4 - test/progress measure.`
    );
    lines.push(
      `   Recommended workouts/practices: 3 focused sessions per week, 1 light recovery session, daily mobility/technique work.`
    );
    lines.push(
      `   How to track: Use a simple log (date, workout, reps/distance/time), take weekly notes and a photo/measurement every two weeks.`
    );
    lines.push("");
  });
  return lines.join("\n");
}

app.post("/api/generate-plan", async (req, res) => {
  try {
    const { goals } = req.body;
    if (!goals || !Array.isArray(goals))
      return res.status(400).json({ error: "goals required (array)" });

    const promptLines = [
      "Create a concise, actionable plan for these goals. For each goal, include: objective, weekly milestones, recommended workouts/practices, and how to track progress. Keep it friendly and specific.\n",
    ];
    goals.forEach((g, i) => {
      promptLines.push(
        `${i + 1}. Goal: ${g.text}\n   Starting progress: ${
          g.progress || "not provided"
        }`
      );
    });
    const prompt = promptLines.join("\n\n");
    console.log("Prepared prompt (truncated):", prompt.slice(0, 300));

    // If SDK or credentials are not available, return deterministic mock plan
    if (!ai) {
      console.warn("No active Gemini SDK instance — returning mock plan.");
      return res.json({ plan: generateMockPlan(goals), usedMock: true });
    }

    // Use structured "contents" (parts) which matches the GenAI REST content shape.
    // Some SDK versions also accept a plain string for `contents`, but the structured shape is safe.
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        // structured contents ensures compatibility with SDK & REST shape
        contents: [
          {
            // "parts" is the canonical REST-like shape the SDK maps to
            parts: [{ text: prompt }],
          },
        ],
        // optional: control token/quality with additional fields if needed
        // temperature: 0.2,
        // candidateCount: 1
      });

      // robust extraction of text across possible response shapes
      let plan = null;
      if (typeof response?.text === "string" && response.text.trim()) {
        plan = response.text;
      } else if (
        response?.output?.[0]?.content?.[0]?.text &&
        typeof response.output[0].content[0].text === "string"
      ) {
        plan = response.output[0].content[0].text;
      } else if (response?.candidates?.[0]?.content?.[0]?.text) {
        plan = response.candidates[0].content[0].text;
      } else if (response?.candidates?.[0]?.text) {
        plan = response.candidates[0].text;
      } else {
        // final fallback: stringify the whole response so client gets something useful
        plan = JSON.stringify(response, null, 2);
      }

      console.log("Received plan (truncated):", plan.slice(0, 300));
      return res.json({ plan, usedMock: false });
    } catch (aiErr) {
      console.error("Gemini SDK call failed, falling back to mock:", aiErr?.message || aiErr);
      const mock = generateMockPlan(goals);
      return res.status(200).json({
        plan: mock,
        usedMock: true,
        notice: "Gemini call failed; returned mock plan. See server logs for details.",
      });
    }
  } catch (err) {
    console.error("Generate plan error:", err?.message || err);
    return res.status(500).json({ error: err?.message || "server error" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`generatePlan server listening on port ${port}`));
