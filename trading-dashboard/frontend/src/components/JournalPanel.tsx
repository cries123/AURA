import type { JournalEntry } from "../types";

interface JournalPanelProps {
  entries: JournalEntry[];
}

export function JournalPanel({ entries }: JournalPanelProps) {
  return (
    <div className="panel journal-panel">
      <div className="panel-header">
        <h3>Session Journal</h3>
        <span className="muted">{entries.length} entries</span>
      </div>
      <div className="journal-list">
        {entries.length === 0 && <p className="muted">Alerts auto-log here for review.</p>}
        {entries.map((e) => (
          <div key={e.id} className="journal-item">
            <div className="journal-top">
              <span className={`tier-badge tier-${(e.tier || "C").toLowerCase()}`}>T{e.tier || "C"}</span>
              <strong>{e.symbol}</strong>
              <span className="muted">{e.setup}</span>
            </div>
            <p>{e.notes}</p>
            <span className="muted">@{e.level_price?.toFixed(2)} · score {e.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
