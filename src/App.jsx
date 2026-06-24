// src/App.jsx
import React, { useState } from "react";
import Dashboard from "./modules/Dashboard.jsx";
import ScamDetector from "./modules/ScamDetector.jsx";
import FraudNetworkGraph from "./modules/FraudNetworkGraph.jsx";
import CitizenShield from "./modules/CitizenShield.jsx";
import "./App.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "◧" },
  { id: "detector", label: "Scam Detector", icon: "◎" },
  { id: "graph", label: "Fraud Network", icon: "◈" },
  { id: "shield", label: "Citizen Shield", icon: "◐" },
];

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [navOpen, setNavOpen] = useState(false);

  const renderModule = () => {
    switch (active) {
      case "dashboard":
        return <Dashboard />;
      case "detector":
        return <ScamDetector />;
      case "graph":
        return <FraudNetworkGraph />;
      case "shield":
        return <CitizenShield />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          onClick={() => setNavOpen((v) => !v)}
        >
          ☰
        </button>
        <div className="brand">
          <span className="brand-mark">▣</span>
          <span className="brand-name">SafeShield<span className="brand-ai">AI</span></span>
        </div>
        <div className="topbar-status">
          <span className="status-dot" />
          Live · National Cyber Crime Net
        </div>
      </header>

      <div className="layout">
        <nav className={`sidebar ${navOpen ? "sidebar-open" : ""}`}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${active === item.id ? "nav-item-active" : ""}`}
              onClick={() => {
                setActive(item.id);
                setNavOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="sidebar-footer">
            <div className="helpline-pill">
              <span className="helpline-label">Cyber Crime Helpline</span>
              <span className="helpline-number">1930</span>
            </div>
            <p className="sidebar-credit">CRP-ET AI Hackathon 2.0 · Problem 6</p>
          </div>
        </nav>

        <main className="content">{renderModule()}</main>
      </div>
    </div>
  );
}
