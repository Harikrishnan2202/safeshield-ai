// src/modules/CitizenShield.jsx
import React, { useEffect, useRef, useState } from "react";
import Card from "../components/Card.jsx";
import { callGemini } from "../api/gemini.js";
import { helplines } from "../data/fraudData.js";
import "./CitizenShield.css";

const SYSTEM_PROMPT = `You are Citizen Shield, the public-facing assistant inside SafeShield AI — a digital safety platform for Indian citizens.

A citizen will describe a suspicious call, message, or situation. Your job:
1. Tell them plainly whether it sounds like a known scam pattern (digital arrest, KYC fraud, fake job, loan app harassment, lottery scam, OTP/UPI fraud, etc.) and why.
2. Give calm, concrete next steps in plain English — no jargon.
3. Always mention the national Cyber Crime Helpline 1930 and cybercrime.gov.in when the situation sounds like fraud, so they can report and try to freeze funds in transit.
4. Reassure them: "digital arrest" is not a real legal procedure in India — the police never make arrests over a video call or demand instant payment.
5. Keep responses short — 3 to 6 sentences, friendly and clear, like a helpful officer at a citizen helpdesk. Use the Indian context (UPI, Aadhaar, RBI, TRAI, CBI naming patterns scammers use) when relevant.

If the message doesn't sound like a scam, say so honestly and explain what makes it look legitimate. Never invent details the citizen didn't tell you.`;

const QUICK_QUESTIONS = [
  "A police officer said I'm under digital arrest, what do I do?",
  "I got an SMS saying my bank KYC will expire, is this real?",
  "Someone offered me a work-from-home job needing a deposit, is it safe?",
  "A loan app agent is threatening to share my photos, what should I do?",
];

function Message({ role, text }) {
  return (
    <div className={`chat-msg chat-msg-${role}`}>
      <div className="chat-bubble">{text}</div>
    </div>
  );
}

export default function CitizenShield() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I'm Citizen Shield. Describe a suspicious call, message, or situation and I'll tell you what it looks like and what to do next.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = history
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.text }));

      const reply = await callGemini(apiMessages, SYSTEM_PROMPT, 800);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `I couldn't reach Gemini (${e.message}). Make sure VITE_GEMINI_API_KEY is set in your .env file.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shield-module">
      <div className="shield-heading">
        <h1>Citizen Shield</h1>
        <p>Describe what happened — get instant, plain-English guidance grounded in Indian cyber-fraud context.</p>
      </div>

      <div className="shield-layout">
        <Card className="chat-card">
          <div className="chat-scroll" ref={scrollRef}>
            {messages.map((m, i) => (
              <Message key={i} role={m.role} text={m.text} />
            ))}
            {loading && (
              <div className="chat-msg chat-msg-assistant">
                <div className="chat-bubble chat-bubble-loading">Typing…</div>
              </div>
            )}
          </div>

          <div className="quick-questions">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                className="quick-question-chip"
                onClick={() => send(q)}
                disabled={loading}
              >
                {q}
              </button>
            ))}
          </div>

          <form
            className="chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              type="text"
              placeholder="Describe the call, message, or situation…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </Card>

        <Card title="Emergency Helplines" className="helpline-card">
          <div className="helpline-list">
            {helplines.map((h) => (
              <div className="helpline-item" key={h.name}>
                <span className="helpline-name">{h.name}</span>
                <span className="helpline-contact">{h.contact}</span>
                <span className="helpline-note">{h.note}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
