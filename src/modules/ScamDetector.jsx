// src/modules/ScamDetector.jsx
import React, { useState } from "react";
import Card from "../components/Card.jsx";
import { callGeminiJSON } from "../api/gemini.js";
import { scamSamples } from "../data/fraudData.js";
import "./ScamDetector.css";

const SYSTEM_PROMPT = `You are a fraud-detection analyst for SafeShield AI, a digital public safety platform built for Indian citizens and law enforcement.

You will be given a raw message: an SMS, WhatsApp text, or transcribed call script. Analyze it for fraud risk using your knowledge of common Indian scam patterns (digital arrest scams impersonating CBI/police/TRAI/customs, KYC/bank update phishing, fake job offers requesting deposits, loan app harassment, lottery/prize scams, UPI fraud, OTP phishing).

Respond with ONLY a JSON object, no preamble, no markdown fences, matching exactly this shape:

{
  "risk_score": <integer 0-100>,
  "scam_type": "<short label, or 'Likely Legitimate' if safe>",
  "is_scam": <boolean>,
  "flags": {
    "urgency_tactics": <boolean>,
    "impersonation": <boolean>,
    "financial_pressure": <boolean>,
    "suspicious_links": <boolean>
  },
  "indicators": ["<short phrase describing a specific red flag found in the text>", ...up to 5],
  "recommended_action": "<one or two sentences of plain-English advice for the citizen, mentioning the 1930 cyber crime helpline if it is a scam>"
}

Be precise and evidence-based: base indicators on what's actually in the text, not generic boilerplate. If the message looks like a genuine bank transaction alert with no red flags, score it low and set is_scam to false.`;

function FlagPill({ active, label }) {
  return (
    <span className={`flag-pill ${active ? "flag-active" : "flag-inactive"}`}>
      <span className="flag-dot" />
      {label}
    </span>
  );
}

function RiskGauge({ score }) {
  let tone = "safe";
  if (score >= 70) tone = "danger";
  else if (score >= 40) tone = "warning";

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="risk-gauge">
      <svg viewBox="0 0 130 130" width="130" height="130">
        <circle cx="65" cy="65" r="54" className="gauge-track" />
        <circle
          cx="65"
          cy="65"
          r="54"
          className={`gauge-fill gauge-${tone}`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
        />
      </svg>
      <div className="gauge-center">
        <span className={`gauge-score gauge-score-${tone}`}>{score}</span>
        <span className="gauge-out-of">/ 100</span>
      </div>
    </div>
  );
}

export default function ScamDetector() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function analyze(text) {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const json = await callGeminiJSON(
        [{ role: "user", content: text }],
        SYSTEM_PROMPT,
        1024
      );
      setResult(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="detector">
      <div className="detector-heading">
        <h1>Scam Detector</h1>
        <p>Paste any SMS, call script, or WhatsApp message — Gemini analyzes it for fraud patterns in real time.</p>
      </div>

      <div className="detector-grid">
        <Card title="Input message" className="detector-input-card">
          <textarea
            className="detector-textarea"
            placeholder="Paste the suspicious message or call transcript here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
          />
          <div className="detector-actions">
            <button
              className="btn-primary"
              onClick={() => analyze(input)}
              disabled={loading || !input.trim()}
            >
              {loading ? "Analyzing…" : "Analyze with Gemini"}
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setInput("");
                setResult(null);
                setError(null);
              }}
            >
              Clear
            </button>
          </div>

          <div className="sample-section">
            <span className="sample-label">Try a sample:</span>
            <div className="sample-chips">
              {scamSamples.map((s) => (
                <button
                  key={s.label}
                  className="sample-chip"
                  onClick={() => {
                    setInput(s.text);
                    analyze(s.text);
                  }}
                  disabled={loading}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Risk analysis" className="detector-result-card">
          {error && (
            <div className="detector-error">
              <strong>Couldn't reach Gemini.</strong>
              <p>{error}</p>
              <p className="detector-error-hint">
                Check that <code>VITE_GEMINI_API_KEY</code> is set in your .env file and the dev server was restarted.
              </p>
            </div>
          )}

          {!error && !result && !loading && (
            <div className="detector-empty">
              Paste a message and hit Analyze, or try a sample on the left.
            </div>
          )}

          {loading && <div className="detector-loading">Running fraud-pattern analysis…</div>}

          {result && !loading && (
            <div className="result-body">
              <div className="result-top">
                <RiskGauge score={result.risk_score} />
                <div className="result-top-text">
                  <span className="result-scam-type">{result.scam_type}</span>
                  <span className={`result-verdict ${result.is_scam ? "verdict-scam" : "verdict-safe"}`}>
                    {result.is_scam ? "⚠ Likely Fraud" : "✓ Likely Legitimate"}
                  </span>
                </div>
              </div>

              <div className="flag-grid">
                <FlagPill active={result.flags?.urgency_tactics} label="Urgency Tactics" />
                <FlagPill active={result.flags?.impersonation} label="Impersonation" />
                <FlagPill active={result.flags?.financial_pressure} label="Financial Pressure" />
                <FlagPill active={result.flags?.suspicious_links} label="Suspicious Links" />
              </div>

              {result.indicators?.length > 0 && (
                <div className="indicators">
                  <span className="indicators-label">Indicators found</span>
                  <ul>
                    {result.indicators.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="recommended-action">
                <span className="indicators-label">Recommended action</span>
                <p>{result.recommended_action}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
