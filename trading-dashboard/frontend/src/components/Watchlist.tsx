import type { Snapshot } from "../types";

interface WatchlistProps {
  snapshots: Snapshot[];
  selected: string;
  onSelect: (symbol: string) => void;
}

function topScore(snapshot: Snapshot): number {
  if (!snapshot.levels?.length) return 0;
  return Math.max(...snapshot.levels.map((l) => l.score));
}

export function Watchlist({ snapshots, selected, onSelect }: WatchlistProps) {
  const sorted = [...snapshots].sort((a, b) => topScore(b) - topScore(a));

  return (
    <div className="panel watchlist-panel">
      <div className="panel-header">
        <h3>Watchlist</h3>
        <span className="muted">{sorted.length} symbols</span>
      </div>
      <div className="watchlist-table">
        <div className="watchlist-row header">
          <span>Symbol</span>
          <span>Last</span>
          <span>Chg%</span>
          <span>Score</span>
          <span>Conf</span>
        </div>
        {sorted.map((snap) => {
          const changePct = snap.quote?.change_pct;
          const isUp = changePct !== undefined && changePct !== null && changePct >= 0;
          const hasAlert = snap.levels?.some((l) => l.proximity || l.sweep_reclaim);
          return (
            <button
              key={snap.symbol}
              className={`watchlist-row ${selected === snap.symbol ? "selected" : ""}`}
              onClick={() => onSelect(snap.symbol)}
            >
              <span className="symbol-cell">
                {hasAlert && <span className="alert-dot" />}
                {snap.symbol}
                <span className="cluster-tag">{snap.cluster}</span>
              </span>
              <span>{snap.last_price?.toFixed(2) ?? "—"}</span>
              <span className={isUp ? "up" : "down"}>
                {changePct !== undefined && changePct !== null
                  ? `${isUp ? "+" : ""}${changePct.toFixed(2)}%`
                  : "—"}
              </span>
              <span className="score-badge">{topScore(snap)}</span>
              <span>{snap.confluence_score ?? 0}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
