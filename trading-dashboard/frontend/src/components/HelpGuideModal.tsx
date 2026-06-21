import { useEffect } from "react";

interface HelpGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpGuideModal({ open, onClose }: HelpGuideModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="help-overlay" onClick={onClose} role="presentation">
      <div
        className="help-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="help-title"
        aria-modal="true"
      >
        <header className="help-header">
          <div>
            <h2 id="help-title">How to Read Alerts &amp; Scores</h2>
            <p className="muted">Quick guide for the live alert feed and setup scoring</p>
          </div>
          <button type="button" className="help-close" onClick={onClose} aria-label="Close help">
            ✕
          </button>
        </header>

        <div className="help-body">
          <section>
            <h3>Live Alert Feed</h3>
            <p>
              The scanner runs every <strong>5 minutes</strong> during market hours and logs events
              when price interacts with a valid <strong>EQL</strong> (Equal Low) or{" "}
              <strong>EQH</strong> (Equal High) on your primary timeframe (usually <strong>5m</strong>{" "}
              for 0DTE names).
            </p>
            <p>Each alert row shows:</p>
            <ul>
              <li><strong>Tier badge</strong> — how urgent / high-quality the setup is</li>
              <li><strong>Symbol</strong> — ticker that triggered</li>
              <li><strong>Event</strong> — what price just did at the level</li>
              <li><strong>Score</strong> — setup quality (higher = stronger confluence)</li>
              <li><strong>sent</strong> — push notification was delivered (Telegram/Discord if configured)</li>
            </ul>
          </section>

          <section>
            <h3>Alert Tiers</h3>
            <div className="help-grid">
              <div className="help-card">
                <span className="tier-badge tier-a">TA</span>
                <strong>Tier A — Act Now</strong>
                <p>
                  SPY / QQQ / SPX only. Score <strong>≥ 8</strong> plus a sweep+reclaim or candle
                  pattern. These are the only alerts that push to your phone by default.
                </p>
              </div>
              <div className="help-card">
                <span className="tier-badge tier-b">TB</span>
                <strong>Tier B — Watch Closely</strong>
                <p>
                  Score <strong>≥ 5</strong>. Solid setup worth reviewing on the chart before trading.
                  Shown in the feed; may not push depending on config.
                </p>
              </div>
              <div className="help-card">
                <span className="tier-badge tier-c">TC</span>
                <strong>Tier C — Journal Only</strong>
                <p>
                  Lower score setups logged for review. Filter these out during live trading using
                  the tier buttons above the feed.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3>Event Types</h3>
            <table className="help-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>What it means</th>
                  <th>Typical bias</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>proximity</td>
                  <td>Price entered the zone near EQL/EQH</td>
                  <td>Watch for reaction</td>
                </tr>
                <tr>
                  <td>sweep reclaim</td>
                  <td>Wick swept through liquidity, then closed back inside</td>
                  <td>Reversal / fade setup</td>
                </tr>
                <tr>
                  <td>acceptance</td>
                  <td>Close beyond the level (break held)</td>
                  <td>Continuation or invalidation</td>
                </tr>
                <tr>
                  <td>candle patterns</td>
                  <td>Engulfing, wick rejection, failed breakout at level</td>
                  <td>Confirms reaction</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3>Setup Score (0–15+)</h3>
            <p>Score is built from confluence factors. Look at the gray factor line under each alert:</p>
            <table className="help-table">
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>3+ touches on the level</td><td>+2</td></tr>
                <tr><td>Multi-timeframe confluence (same level on 2+ TFs)</td><td>+2 to +3</td></tr>
                <tr><td>Sweep + reclaim at level</td><td>+2</td></tr>
                <tr><td>Price at level (proximity)</td><td>+1</td></tr>
                <tr><td>EQL + bullish structure / EQH + bearish structure</td><td>+2</td></tr>
                <tr><td>Ranging market structure</td><td>+1</td></tr>
                <tr><td>Acceptance beyond level</td><td>+1</td></tr>
                <tr><td>OR / session level alignment, VWAP, candle pattern</td><td>+1 to +3</td></tr>
                <tr><td>Price testing level right now</td><td>+1</td></tr>
              </tbody>
            </table>
            <p className="help-tip">
              <strong>Rule of thumb:</strong> Score <strong>5+</strong> = worth a look. Score{" "}
              <strong>8+</strong> with sweep/reclaim on SPY/QQQ = highest conviction for 0DTE.
            </p>
          </section>

          <section>
            <h3>Level Validity</h3>
            <p>Only <strong>valid</strong> and <strong>testing</strong> levels appear in brackets and on the chart.</p>
            <ul>
              <li><span className="validity-badge valid">valid</span> — Liquidity still in play, not broken</li>
              <li><span className="validity-badge testing">testing</span> — Price is interacting with the level now</li>
              <li><span className="validity-badge stale">stale</span> — No recent touch; filtered out</li>
              <li><span className="validity-badge invalidated">invalidated</span> — Closed through level; filtered out</li>
            </ul>
          </section>

          <section>
            <h3>Suggested Workflow</h3>
            <ol>
              <li>Filter feed to <strong>Tier A</strong> during active trading</li>
              <li>Click the symbol in the watchlist to open the chart</li>
              <li>Confirm EQL ↔ EQH bracket on your timeframe</li>
              <li>Check 0DTE bar: EM used, VWAP position, GEX regime</li>
              <li>Use the trade idea panel for defined-risk structure ideas</li>
              <li>Journal auto-logs every alert for end-of-day review</li>
            </ol>
          </section>
        </div>

        <footer className="help-footer">
          <button type="button" className="btn primary" onClick={onClose}>
            Got it
          </button>
        </footer>
      </div>
    </div>
  );
}
