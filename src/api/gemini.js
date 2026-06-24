// src/api/gemini.js
// Thin wrapper around Google's Gemini API (free tier, no credit card needed)
// for direct browser calls.
//
// NOTE: calling Gemini directly from the browser exposes your key to anyone
// who opens devtools. That's fine for a hackathon demo on your own laptop,
// but before shipping this anywhere public, move this call behind a tiny
// backend proxy (see README "Going to production").
//
// Get a free key at https://aistudio.google.com/app/apikey — no card required.

const MODEL = "gemini-2.5-flash";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

function getApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key.includes("XXXX")) {
    throw new Error(
      "No Gemini API key found. Add VITE_GEMINI_API_KEY to your .env file. Get one free at https://aistudio.google.com/app/apikey"
    );
  }
  return key;
}

/**
 * Send a single-turn or multi-turn prompt to Gemini and get back raw text.
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages - same shape used across the app
 * @param {string} system - system instruction
 * @param {number} maxTokens
 */
export async function callGemini(messages, system, maxTokens = 1024) {
  const url = `${BASE_URL}/${MODEL}:generateContent?key=${getApiKey()}`;

  // Gemini uses "model" instead of "assistant", and wraps text in `parts`.
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body = {
    contents,
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: {
      // Gemini 2.5 Flash has "thinking" turned on by default, and those
      // invisible reasoning tokens are deducted from maxOutputTokens before
      // the model writes anything visible. For short, structured tasks like
      // ours that don't need chain-of-thought, we turn thinking off so the
      // full token budget goes to the actual answer instead of being eaten
      // by reasoning we never see — this is what was causing responses to
      // get cut off mid-JSON.
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: maxTokens,
      temperature: 0.4,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errBody}`);
  }

  const data = await res.json();

  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new Error("Gemini returned no candidates. The prompt may have been blocked by safety filters.");
  }

  const text = (candidate.content?.parts || [])
    .map((p) => p.text || "")
    .join("\n")
    .trim();

  // If the model ran out of room before finishing, say so clearly instead of
  // handing back partial text that will fail to parse downstream with a
  // confusing error.
  if (candidate.finishReason === "MAX_TOKENS") {
    throw new Error(
      "Gemini's response was cut off because it ran out of output tokens. Try again, or increase maxTokens in the calling code."
    );
  }

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}

/**
 * Call Gemini and force a JSON-only response. Strips markdown fences
 * defensively in case the model wraps the JSON anyway.
 */
export async function callGeminiJSON(messages, system, maxTokens = 1024) {
  const jsonSystem = `${system}\n\nIMPORTANT: Respond with ONLY raw JSON. No markdown code fences, no preamble, no explanation before or after the JSON object.`;
  const raw = await callGemini(messages, jsonSystem, maxTokens);
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // A response that doesn't end in "}" almost always means it got cut off
    // mid-generation rather than being malformed JSON from the start.
    const looksTruncated = !cleaned.trim().endsWith("}");
    const hint = looksTruncated
      ? "The response looks like it was cut off before finishing. Try again — if it keeps happening, increase maxTokens."
      : "The response wasn't valid JSON.";
    throw new Error(`${hint} Raw response: ${cleaned}`);
  }
}
