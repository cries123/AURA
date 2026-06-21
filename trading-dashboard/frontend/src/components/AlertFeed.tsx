import type { Alert } from "../types";

interface AlertFeedProps {
  alerts: Alert[];
  onOpenHelp?: () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function AlertFeed({ alerts, onOpenHelp }: AlertFeedProps) {
  return (
    <div className="panel alert-panel">
      <div className="panel-header">
        <h3>Live Alert Feed</h3>
        <div className="panel-header-actions">
          <span className="muted">{alerts.length} events</span>
          {onOpenHelp && (
            <button type="button" className="help-trigger" onClick={onOpenHelp}>
              How to read alerts
            </button>
          )}
        </div>
      </div>
      <div className="alert-list">
        {alerts.length === 0 && <p className="muted empty">No alerts yet — scanner runs every 5 min.</p>}
        {alerts.map((alert) => (
          <div key={alert.id} className="alert-item">
            <div className="alert-top">
              <span className={`tier-badge tier-${(alert.tier || "B").toLowerCase()}`}>T{alert.tier || "B"}</span>
              <span className="alert-symbol">{alert.symbol}</span>
              <span className="alert-event">{alert.event_type.replace("_", " ")}</span>
              <span className="score-badge">{alert.score}</span>
              {alert.notified && <span className="notified-badge">sent</span>}
            </div>
            <div className="alert-message">{stripHtml(alert.message)}</div>
            <div className="alert-meta">
              <span>{alert.timeframe.toUpperCase()}</span>
              {alert.level_type && (
                <span>
                  {alert.level_type} @ {alert.level_price?.toFixed(2)}
                </span>
              )}
              <span>{formatTime(alert.created_at)}</span>
            </div>
            {alert.score_factors?.length > 0 && (
              <div className="alert-factors">{alert.score_factors.join(" · ")}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "");
}
