# 🛡️ SafeShield AI — Digital Public Safety Platform

**CRP-ET AI Hackathon 2.0 · Problem Statement 6: Digital Public Safety / Fraud Detection**

A real-time AI-powered fraud detection and citizen-protection platform for India, built with React + the **free Google Gemini API** (no credit card required).

---

## What's inside

| Module | What it does |
|---|---|
| **Dashboard** | Live-style metrics, weekly threat trend chart, scam category breakdown, live alert feed |
| **Scam Detector** | Paste any SMS / call script / WhatsApp message → Gemini returns a 0–100 risk score, scam type, red-flag indicators, and recommended action |
| **Fraud Network Graph** | Interactive, draggable force-directed graph (built with plain SVG — no D3 needed) showing a 14-node fraud ring: ring leader, callers, mule accounts, SIM cards, victims |
| **Citizen Shield** | A Gemini-powered chatbot citizens can describe an incident to and get plain-English guidance, grounded in Indian cyber-fraud context (1930 helpline, CERT-In, RBI) |

This is a **real, working codebase** — not a mockup. Every file below is meant to be run, not just read.

---

## Project structure

```
safeshield/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── .gitignore
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx                # Shell: sidebar nav + module switcher
    ├── App.css
    ├── index.css               # Design tokens (colors, fonts, etc.)
    ├── api/
    │   └── gemini.js           # Google Gemini API client (callGemini, callGeminiJSON)
    ├── data/
    │   └── fraudData.js        # Synthetic Indian fraud dataset (dashboard + graph)
    ├── components/
    │   ├── Card.jsx
    │   └── Card.css
    └── modules/
        ├── Dashboard.jsx / .css
        ├── ScamDetector.jsx / .css
        ├── FraudNetworkGraph.jsx / .css
        └── CitizenShield.jsx / .css
```

---

## How to run it

### Step 1 — Install Node.js
Download Node 18+ from https://nodejs.org if you don't have it.

### Step 2 — Install dependencies
From inside the `safeshield/` folder:
```bash
npm install
```

### Step 3 — Get a FREE Gemini API key (no card needed)
1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with any Google account
3. Click **Create API Key**
4. Copy the key (starts with `AIzaSy...`)

This is genuinely free — Google's Gemini free tier (Flash models) doesn't require a credit card and doesn't expire, as long as you don't separately enable billing on that project. It comes with daily/per-minute request limits, which is more than enough for a hackathon demo.

### Step 4 — Add your key
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and replace the placeholder with your real key:
```
VITE_GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5 — Start the dev server
```bash
npm run dev
```
Open the URL it prints — usually **http://localhost:5173**

That's it. All four modules work immediately; only Scam Detector and Citizen Shield need the API key (Dashboard and Fraud Network Graph run entirely on local synthetic data, no AI calls).

---

## Alternative: zero-install options

**CodeSandbox**
1. Go to https://codesandbox.io/s/new → choose the React (Vite) template
2. Delete the generated `src/` and drop in this project's `src/` folder, plus the root config files
3. Add `VITE_GEMINI_API_KEY` under Settings → Environment Variables
4. It runs instantly in-browser

**StackBlitz**
1. Go to https://stackblitz.com/fork/react
2. Same idea — replace the scaffolded files with this project's files
3. Add the env var, and the live preview updates automatically

---

## About the free Gemini tier

- **Model used**: `gemini-2.5-flash` — fast, free-tier eligible, and good quality for both the scam-analysis JSON task and the conversational Citizen Shield chat.
- **No credit card required** to get a key or to use it within free-tier limits.
- **Rate limits exist** (requests per minute and per day) — generous enough for live demo use, but if you hammer the Analyze button dozens of times in rapid succession while testing, you may see a `429` rate-limit error. Just wait a minute and retry.
- Google's terms note that free-tier prompts may be used to improve their models (this is different from the paid tier). Fine for a hackathon demo with synthetic/sample data; worth knowing if you ever process real citizen data.
- If you outgrow the free tier later, enabling billing moves you to paid pricing — there's no need to do this for the hackathon.

---

## Going to production (after the hackathon)

Calling Gemini directly from the browser is a demo shortcut, not a security model. For anything beyond a judged demo:

1. Stand up a minimal backend (FastAPI, Express, or a Cloudflare Worker) with one route, e.g. `POST /api/analyze`.
2. Move the `fetch(...)` calls from `src/api/gemini.js` into that backend route, with the Gemini key stored as a server-side secret (never `VITE_`-prefixed, which Vite inlines into the public bundle).
3. Point the frontend at your own backend route instead of `generativelanguage.googleapis.com` directly.
4. Add rate limiting on that route — Scam Detector and Citizen Shield are the only two modules that make live API calls.

---

## Demo script (for judges, <2 min)

1. **Scam Detector** — paste the "Digital Arrest Call Script" sample, watch the risk gauge land at 90+, point out the specific indicators Gemini pulled out of the text (not generic boilerplate).
2. **Fraud Network Graph** — drag the "Handler X" node, show how mule accounts, SIM cards, and victims are all connected to one ring leader — this is the "we don't just flag messages, we map the syndicate" pitch.
3. **Citizen Shield** — click the quick question "A police officer said I'm under digital arrest, what do I do?" and let the bot explain that digital arrest isn't a real legal procedure, then point to the 1930 helpline.
4. **Dashboard** — close on the metrics: 18,420 scans today, 612 high-risk flags, 23 fraud rings currently tracked — this is the "scale" story for business impact.

---

## Judging criteria coverage

- **Innovation** — Multi-modal fraud detection (SMS, call scripts, WhatsApp text) + graph-based syndicate mapping, not just single-message rules
- **Business impact** — Plugs directly into India's existing 1930 / cybercrime.gov.in infrastructure rather than reinventing reporting channels
- **Technical depth** — Real Gemini inference (structured JSON output) for the detector, real conversational reasoning for Citizen Shield, a from-scratch force-directed graph simulation
- **UX** — Four focused modules, consistent dark UI, mobile-responsive sidebar
- **Scalability** — Stateless API calls; works for any Indian city/state with no data-model changes

---

## Tech stack

- **Frontend**: React 18 (hooks only, no class components), Vite
- **Styling**: Hand-rolled CSS with a small design-token system — no Tailwind/Bootstrap dependency to install
- **AI**: Google Gemini API, model `gemini-2.5-flash` (free tier)
- **Graph**: Plain SVG + a ~40-line custom force simulation (repulsion + spring links + center pull) — zero extra dependencies
- **Charts**: Custom SVG bar/progress charts

---

## Troubleshooting

**"No Gemini API key found" error in the app**
Your `.env` file is missing or the dev server needs a restart after you edited it. Run `cp .env.example .env`, paste your real key in, stop the dev server (Ctrl+C) and run `npm run dev` again — Vite only reads `.env` at startup.

**429 / rate limit error**
You've hit the free-tier requests-per-minute cap. Wait about a minute and try again. This is unlikely to happen during a normal demo pace.

**"Gemini returned no candidates... blocked by safety filters"**
Very rare for this app's prompts, but can happen if you paste an unusually graphic or unrelated message into the Scam Detector. Try a different sample or rephrase.

**"Failed to parse Gemini JSON response" / response looks cut off mid-sentence**
This was a real bug in earlier versions of this app: Gemini 2.5 Flash has internal "thinking" turned on by default, and those invisible reasoning tokens were eating into the same token budget as the visible JSON answer, sometimes cutting it off before the closing `}`. Fixed by setting `thinkingConfig: { thinkingBudget: 0 }` in `src/api/gemini.js` (this app's structured tasks don't need chain-of-thought) and raising the token ceiling as a safety margin. If you still see this occasionally, just click Analyze again — and if it happens often, bump the `maxTokens` argument passed to `callGeminiJSON` / `callGemini` in the relevant module a bit higher.

---
Realistic Citizen Shield test questions
1. Panicked, mid-scam
Someone just called me saying they're from Mumbai Police and I'm involved in a parcel containing illegal items, they want me to stay on video call right now or they'll send a team to arrest me. I'm scared, what do I do?
2. Skeptical, checking before acting
I got a message saying I won a lucky draw of 10 lakhs from Amazon and need to pay 2000 rupees as tax to claim it. Is this real or fake?
3. Already a victim, asking what to do next
I already paid 5000 rupees to someone who said my electricity will be cut off today if I don't pay immediately through a QR code. Now I think it was a scam. What should I do now?
4. Job seeker, unsure
A recruiter on Telegram offered me a job reviewing products online for 3000 rupees per day, but first I need to pay a 1500 rupee registration fee. Should I pay it?
5. Elderly relative scenario
My father got a call saying his bank account will be frozen unless he shares the OTP he just received. He almost shared it but didn't. Was that a scam attempt?
6. Loan app harassment
I took a small loan from an app and now they're calling my relatives and threatening to share edited photos of me if I don't pay extra charges I never agreed to. What can I do?
7. Genuinely unsure / borderline case
My bank sent me an SMS saying my debit card will expire this month and to visit the branch to renew it. Is this normal or could it be fake?
8. Asking about a tactic, not a specific incident
What is a digital arrest scam and how do I know if a call is fake or if police are actually allowed to do that?

## Emergency helplines (already wired into the app)

- **1930** — National Cyber Crime Helpline
- **cybercrime.gov.in** — Online complaint portal
- **CERT-In** — cert-in.org.in
- **RBI Banking Ombudsman** — cms.rbi.org.in

---

Built for CRP-ET AI Hackathon 2.0 · Economic Times
