// src/modules/Dashboard.jsx
import React from "react";
import Card from "../components/Card.jsx";
import {
  weeklyThreatTrend,
  scamCategories,
  liveAlerts,
  metrics,
} from "../data/fraudData.js";
import "./Dashboard.css";

function MetricTile({ label, value, suffix = "", tone = "default" }) {
  return (
    <div className={`metric-tile tone-${tone}`}>
      <span className="metric-value">
        {value.toLocaleString("en-IN")}
        {suffix}
      </span>
      <span className="metric-label">{label}</span>
    </div>
  );
}

function WeeklyBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div className="bar-chart">
      {data.map((d) => {
        const heightPct = (d.count / max) * 100;
        const isSpike = d.day === "Fri";
        return (
          <div className="bar-col" key={d.day}>
            <span className="bar-value">{d.count}</span>
            <div className="bar-track">
              <div
                className={`bar-fill ${isSpike ? "bar-fill-spike" : ""}`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="bar-day">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

function CategoryBreakdown({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="category-list">
      {data.map((d) => (
        <div className="category-row" key={d.label}>
          <div className="category-row-top">
            <span className="category-label">{d.label}</span>
            <span className="category-pct">{Math.round((d.value / total) * 100)}%</span>
          </div>
          <div className="category-track">
            <div
              className="category-fill"
              style={{
                width: `${(d.value / total) * 100}%`,
                background: d.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RiskBadge({ risk }) {
  let tone = "low";
  if (risk >= 85) tone = "high";
  else if (risk >= 60) tone = "mid";
  return <span className={`risk-badge risk-${tone}`}>{risk}</span>;
}

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <h1>National Threat Overview</h1>
        <p>Synthetic demo data · refreshes simulate real-time ingestion from citizen reports and partner banks</p>
      </div>

      <div className="metric-grid">
        <MetricTile label="Messages Scanned Today" value={metrics.scansToday} tone="info" />
        <MetricTile label="High-Risk Flags" value={metrics.highRiskFlags} tone="danger" />
        <MetricTile label="Citizens Protected" value={metrics.citizensProtected} tone="safe" />
        <MetricTile label="Active Fraud Rings Tracked" value={metrics.activeFraudRings} tone="warning" />
      </div>

      <div className="dashboard-grid">
        <Card
          title="Weekly Threat Volume"
          subtitle="Friday spike correlates with salary-cycle disbursement"
          className="span-2"
        >
          <WeeklyBarChart data={weeklyThreatTrend} />
        </Card>

        <Card title="Scam Category Mix" subtitle="Share of flagged incidents, last 7 days">
          <CategoryBreakdown data={scamCategories} />
        </Card>

        <Card
          title="Live Threat Feed"
          subtitle="Most recent citizen-reported & auto-flagged incidents"
          className="span-3"
        >
          <div className="alert-table">
            <div className="alert-table-head">
              <span>Risk</span>
              <span>Type</span>
              <span>Location</span>
              <span>Detail</span>
              <span>Reported</span>
            </div>
            {liveAlerts.map((a) => (
              <div className="alert-row" key={a.id}>
                <RiskBadge risk={a.risk} />
                <span className="alert-type">{a.type}</span>
                <span className="alert-location">{a.location}</span>
                <span className="alert-detail">{a.detail}</span>
                <span className="alert-time">{a.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
