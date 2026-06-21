import type { DivergenceData } from "../types";

interface DivergencePanelProps {
  data?: DivergenceData;
}

export function DivergencePanel({ data }: DivergencePanelProps) {
  if (!data?.performance) return null;

  return (
    <div className="panel divergence-panel">
      <div className="panel-header">
        <h3>Index Divergence</h3>
        <span className="muted">
          Lead {data.leader} · Lag {data.laggard}
        </span>
      </div>
      <div className="divergence-perf">
        {Object.entries(data.performance).map(([sym, pct]) => (
          <div key={sym} className="perf-chip">
            <strong>{sym}</strong>
            <span className={pct >= 0 ? "up" : "down"}>
              {pct >= 0 ? "+" : ""}
              {pct.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      {data.signals?.map((s, i) => (
        <p key={i} className="divergence-signal">{s}</p>
      ))}
    </div>
  );
}
