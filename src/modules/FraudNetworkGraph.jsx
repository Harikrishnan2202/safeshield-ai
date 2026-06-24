// src/modules/FraudNetworkGraph.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import Card from "../components/Card.jsx";
import { fraudNetwork } from "../data/fraudData.js";
import "./FraudNetworkGraph.css";

const WIDTH = 760;
const HEIGHT = 480;

const GROUP_COLORS = {
  leader: "#ef4444",
  caller: "#ff7a3d",
  mule: "#f5a623",
  sim: "#4f9dde",
  victim: "#5e6b78",
};

const GROUP_RADIUS = {
  leader: 22,
  caller: 16,
  mule: 14,
  sim: 12,
  victim: 12,
};

// Initialize node positions in a circle, then run a lightweight force
// simulation (spring links + node repulsion) entirely in JS — no D3 needed.
function initNodes() {
  const n = fraudNetwork.nodes.length;
  return fraudNetwork.nodes.map((node, i) => {
    const angle = (i / n) * Math.PI * 2;
    return {
      ...node,
      x: WIDTH / 2 + Math.cos(angle) * 180,
      y: HEIGHT / 2 + Math.sin(angle) * 150,
      vx: 0,
      vy: 0,
    };
  });
}

function simulationStep(nodes, links) {
  const repulsion = 1800;
  const linkStrength = 0.02;
  const linkDistance = 110;
  const damping = 0.82;
  const center = { x: WIDTH / 2, y: HEIGHT / 2 };
  const centerPull = 0.002;

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // Repulsion between all pairs
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let distSq = dx * dx + dy * dy;
      if (distSq < 1) distSq = 1;
      const dist = Math.sqrt(distSq);
      const force = repulsion / distSq;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      if (!a.fixed) { a.vx -= fx; a.vy -= fy; }
      if (!b.fixed) { b.vx += fx; b.vy += fy; }
    }
  }

  // Spring links
  links.forEach((l) => {
    const a = byId[l.source];
    const b = byId[l.target];
    if (!a || !b) return;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const diff = dist - linkDistance;
    const fx = (dx / dist) * diff * linkStrength;
    const fy = (dy / dist) * diff * linkStrength;
    if (!a.fixed) { a.vx += fx; a.vy += fy; }
    if (!b.fixed) { b.vx -= fx; b.vy -= fy; }
  });

  // Center pull + integrate
  nodes.forEach((n) => {
    if (n.fixed) return;
    n.vx += (center.x - n.x) * centerPull;
    n.vy += (center.y - n.y) * centerPull;
    n.vx *= damping;
    n.vy *= damping;
    n.x += n.vx;
    n.y += n.vy;

    const r = GROUP_RADIUS[n.group] || 12;
    n.x = Math.max(r + 10, Math.min(WIDTH - r - 10, n.x));
    n.y = Math.max(r + 10, Math.min(HEIGHT - r - 10, n.y));
  });
}

export default function FraudNetworkGraph() {
  const [nodes, setNodes] = useState(initNodes);
  const [hovered, setHovered] = useState(null);
  const [dragId, setDragId] = useState(null);
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const runSimulation = useCallback((ticks = 1) => {
    for (let t = 0; t < ticks; t++) {
      simulationStep(nodesRef.current, fraudNetwork.links);
    }
    setNodes([...nodesRef.current]);
  }, []);

  // Run an initial settle animation on mount
  useEffect(() => {
    let frame = 0;
    const maxFrames = 90;
    function tick() {
      simulationStep(nodesRef.current, fraudNetwork.links);
      setNodes([...nodesRef.current]);
      frame++;
      if (frame < maxFrames) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function svgPoint(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function handlePointerDown(node) {
    setDragId(node.id);
    node.fixed = true;
  }

  function handlePointerMove(e) {
    if (!dragId) return;
    const pt = svgPoint(e);
    const node = nodesRef.current.find((n) => n.id === dragId);
    if (node) {
      node.x = pt.x;
      node.y = pt.y;
      node.vx = 0;
      node.vy = 0;
      setNodes([...nodesRef.current]);
    }
  }

  function handlePointerUp() {
    if (dragId) {
      const node = nodesRef.current.find((n) => n.id === dragId);
      if (node) node.fixed = false;
    }
    setDragId(null);
  }

  function reshuffle() {
    nodesRef.current = initNodes();
    runSimulation(0);
    let frame = 0;
    const maxFrames = 90;
    function tick() {
      simulationStep(nodesRef.current, fraudNetwork.links);
      setNodes([...nodesRef.current]);
      frame++;
      if (frame < maxFrames) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const groupCounts = nodes.reduce((acc, n) => {
    acc[n.group] = (acc[n.group] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="graph-module">
      <div className="graph-heading">
        <div>
          <h1>Fraud Network Graph</h1>
          <p>Interactive map of a tracked fraud ring — drag any node to explore connections</p>
        </div>
        <button className="btn-ghost" onClick={reshuffle}>
          ⟳ Reshuffle
        </button>
      </div>

      <div className="graph-layout">
        <Card className="graph-canvas-card">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="graph-svg"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {fraudNetwork.links.map((l, i) => {
              const a = byId[l.source];
              const b = byId[l.target];
              if (!a || !b) return null;
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="graph-link"
                />
              );
            })}

            {nodes.map((n) => (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                className="graph-node"
                onPointerDown={() => handlePointerDown(n)}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered((h) => (h === n.id ? null : h))}
              >
                <circle
                  r={GROUP_RADIUS[n.group] || 12}
                  fill={GROUP_COLORS[n.group] || "#888"}
                  className={hovered === n.id ? "node-circle-hover" : "node-circle"}
                />
                <text
                  y={(GROUP_RADIUS[n.group] || 12) + 13}
                  className="node-label"
                  textAnchor="middle"
                >
                  {n.label}
                </text>
              </g>
            ))}
          </svg>

          {hovered && byId[hovered] && (
            <div className="graph-tooltip">
              <strong>{byId[hovered].label}</strong>
              <span className="tooltip-group">{byId[hovered].group.toUpperCase()}</span>
              <span className="tooltip-risk">Risk score: {byId[hovered].risk}</span>
            </div>
          )}
        </Card>

        <div className="graph-sidebar">
          <Card title="Legend">
            <div className="legend-list">
              {Object.entries(GROUP_COLORS).map(([group, color]) => (
                <div className="legend-row" key={group}>
                  <span className="legend-dot" style={{ background: color }} />
                  <span className="legend-name">{group}</span>
                  <span className="legend-count">{groupCounts[group] || 0}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Network Intelligence">
            <ul className="intel-list">
              <li><strong>1</strong> ring leader directing operations across 2 caller cells</li>
              <li><strong>4</strong> mule accounts laundering proceeds within 24–48 hrs</li>
              <li><strong>3</strong> SIM cards traced to a single distributor in border district</li>
              <li><strong>4</strong> confirmed victims across 4 states, avg. loss ₹1.8L</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
