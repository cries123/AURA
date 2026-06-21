import type { ZeroDTEContext } from "../types";

interface SessionLevelsPanelProps {
  zerodte: ZeroDTEContext | null | undefined;
}

const LABELS: Record<string, string> = {
  prior_day_high: "PDH",
  prior_day_low: "PDL",
  prior_day_close: "PDC",
  premarket_high: "PMH",
  premarket_low: "PML",
  or_5m_high: "OR5 H",
  or_5m_low: "OR5 L",
  or_15m_high: "OR15 H",
  or_15m_low: "OR15 L",
  or_30m_high: "OR30 H",
  or_30m_low: "OR30 L",
};

export function SessionLevelsPanel({ zerodte }: SessionLevelsPanelProps) {
  const levels = zerodte?.session_levels;
  if (!levels) return null;

  return (
    <div className="panel session-panel">
      <h3>Session Levels</h3>
      <div className="session-grid">
        {Object.entries(levels).map(([k, v]) =>
          v != null ? (
            <div key={k} className={`session-cell ${zerodte?.session_level_hits?.includes(k) ? "hit" : ""}`}>
              <span>{LABELS[k] || k}</span>
              <strong>{v.toFixed(2)}</strong>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
