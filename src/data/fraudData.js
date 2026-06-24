// src/data/fraudData.js
// Synthetic but realistic Indian digital-fraud data for demo purposes.
// All names, numbers, and IDs are fictional.

export const weeklyThreatTrend = [
  { day: "Mon", count: 142 },
  { day: "Tue", count: 158 },
  { day: "Wed", count: 134 },
  { day: "Thu", count: 171 },
  { day: "Fri", count: 268 }, // salary-cycle spike
  { day: "Sat", count: 211 },
  { day: "Sun", count: 119 },
];

export const scamCategories = [
  { label: "Digital Arrest", value: 32, color: "var(--danger)" },
  { label: "KYC / Bank Update", value: 26, color: "var(--warning)" },
  { label: "Fake Job Offer", value: 19, color: "var(--accent)" },
  { label: "Loan App Harassment", value: 14, color: "var(--info)" },
  { label: "Lottery / Gift", value: 9, color: "var(--muted-accent)" },
];

export const liveAlerts = [
  {
    id: "A-1042",
    time: "2 min ago",
    type: "Digital Arrest",
    location: "Pune, MH",
    risk: 94,
    detail: "Caller impersonating CBI officer demanding video call, citing fake parcel seizure.",
  },
  {
    id: "A-1041",
    time: "6 min ago",
    type: "KYC Fraud",
    location: "Indore, MP",
    risk: 88,
    detail: "SMS link claiming bank account will be blocked in 2 hours without re-KYC.",
  },
  {
    id: "A-1040",
    time: "11 min ago",
    type: "Fake Job Offer",
    location: "Patna, BR",
    risk: 76,
    detail: "WhatsApp message offering ₹45,000/month work-from-home, asking for refundable deposit.",
  },
  {
    id: "A-1039",
    time: "18 min ago",
    type: "Loan App Harassment",
    location: "Hyderabad, TS",
    risk: 81,
    detail: "Recovery agent threatening to morph victim's photos and share with contacts.",
  },
  {
    id: "A-1038",
    time: "24 min ago",
    type: "Digital Arrest",
    location: "Lucknow, UP",
    risk: 91,
    detail: "Fake TRAI executive claims SIM linked to narcotics case, demands UPI 'verification' payment.",
  },
];

export const metrics = {
  scansToday: 18420,
  highRiskFlags: 612,
  citizensProtected: 9870,
  activeFraudRings: 23,
};

// Fraud network graph: a ring leader, mule accounts, SIM cards, and victims
export const fraudNetwork = {
  nodes: [
    { id: "ring-leader-1", label: "Handler X", group: "leader", risk: 98 },
    { id: "mule-1", label: "Mule A/C 1", group: "mule", risk: 82 },
    { id: "mule-2", label: "Mule A/C 2", group: "mule", risk: 79 },
    { id: "mule-3", label: "Mule A/C 3", group: "mule", risk: 75 },
    { id: "mule-4", label: "Mule A/C 4", group: "mule", risk: 71 },
    { id: "sim-1", label: "SIM #4471", group: "sim", risk: 88 },
    { id: "sim-2", label: "SIM #2290", group: "sim", risk: 85 },
    { id: "sim-3", label: "SIM #7714", group: "sim", risk: 80 },
    { id: "caller-1", label: "Caller #1", group: "caller", risk: 90 },
    { id: "caller-2", label: "Caller #2", group: "caller", risk: 86 },
    { id: "victim-1", label: "Victim (Pune)", group: "victim", risk: 20 },
    { id: "victim-2", label: "Victim (Indore)", group: "victim", risk: 20 },
    { id: "victim-3", label: "Victim (Patna)", group: "victim", risk: 20 },
    { id: "victim-4", label: "Victim (Lucknow)", group: "victim", risk: 20 },
  ],
  links: [
    { source: "ring-leader-1", target: "mule-1" },
    { source: "ring-leader-1", target: "mule-2" },
    { source: "ring-leader-1", target: "mule-3" },
    { source: "ring-leader-1", target: "mule-4" },
    { source: "ring-leader-1", target: "caller-1" },
    { source: "ring-leader-1", target: "caller-2" },
    { source: "caller-1", target: "sim-1" },
    { source: "caller-2", target: "sim-2" },
    { source: "ring-leader-1", target: "sim-3" },
    { source: "caller-1", target: "victim-1" },
    { source: "caller-1", target: "victim-2" },
    { source: "caller-2", target: "victim-3" },
    { source: "caller-2", target: "victim-4" },
    { source: "mule-1", target: "victim-1" },
    { source: "mule-2", target: "victim-2" },
    { source: "mule-3", target: "victim-3" },
    { source: "mule-4", target: "victim-4" },
  ],
};

// Preloaded scam samples for the Scam Detector demo
export const scamSamples = [
  {
    label: "Digital Arrest Call Script",
    text: "This is Inspector Verma from CBI Cyber Cell, Mumbai. Your Aadhaar number has been used in a money laundering case linked to a parcel containing drugs sent to Taiwan. You are under digital arrest. Do not disconnect this call or inform anyone. Stay on video call and transfer ₹2,00,000 to the RBI verification account for clearance, or a team will arrive at your house within 1 hour to arrest you.",
  },
  {
    label: "KYC / Bank Update SMS",
    text: "Dear Customer, your SBI account KYC has expired and will be BLOCKED within 2 hours. Update immediately by clicking: http://sbi-kyc-update.in/verify to avoid suspension. - SBI Bank",
  },
  {
    label: "Fake Job Offer WhatsApp",
    text: "Congratulations! You are shortlisted for a Part Time Data Entry Job. Earn ₹3000-5000 daily, work just 2 hours from home. To activate your ID, pay a refundable registration fee of ₹499 via this Google Pay number. Limited seats available, reply YES now.",
  },
  {
    label: "Legitimate Bank SMS (control)",
    text: "Dear Customer, your A/C XX4521 is debited INR 1,500.00 on 21-06-26 at AMAZON. Avl Bal INR 24,310.50. If not done by you, call 1800-XXX-XXXX immediately. - HDFC Bank",
  },
];

export const helplines = [
  { name: "National Cyber Crime Helpline", contact: "1930", note: "Call immediately to freeze funds in transit" },
  { name: "Cyber Crime Reporting Portal", contact: "cybercrime.gov.in", note: "File a formal complaint online" },
  { name: "CERT-In", contact: "cert-in.org.in", note: "Report phishing links & malicious sites" },
  { name: "RBI Banking Ombudsman", contact: "cms.rbi.org.in", note: "Escalate unresolved bank fraud disputes" },
];
