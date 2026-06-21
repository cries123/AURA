import type { Snapshot, EventsData, BreadthData } from "../types";

interface ZeroDTEBarProps {
  snapshot: Snapshot | null;
  events?: EventsData;
  breadth?: BreadthData;
}

export function ZeroDTEBar({ snapshot, events, breadth }: ZeroDTEBarProps) {
  const z = snapshot?.zerodte;
  if (!z && !events) return null;

  const em = z?.em_consumed?.consumed_pct;
  const gex = z?.chain?.gex?.regime;
  const vwap = z?.vwap?.position;

  return (
    <div className="zerodte-bar">
      <div className="zd-chip">
        <span className="zd-label">0DTE</span>
        <span>{snapshot?.symbol}</span>
        {z?.chain?.is_0dte && <span className="badge-0dte">TODAY</span>}
      </div>
      {em != null && (
        <div className="zd-chip">
          <span className="zd-label">EM used</span>
          <span className={em > 70 ? "warn" : ""}>{em}%</span>
        </div>
      )}
      {gex && (
        <div className="zd-chip">
          <span className="zd-label">GEX</span>
          <span>{gex}</span>
        </div>
      )}
      {vwap && (
        <div className="zd-chip">
          <span className="zd-label">VWAP</span>
          <span>{vwap}</span>
        </div>
      )}
      {z?.pin_risk?.pin_risk && (
        <div className="zd-chip">
          <span className="zd-label">Pin</span>
          <span>{z.pin_risk.pin_risk}</span>
        </div>
      )}
      {events?.is_power_hour && <div className="zd-chip power">Power Hour</div>}
      {events?.is_blocked_window && <div className="zd-chip blocked">Blocked Window</div>}
      {breadth && (
        <div className="zd-chip">
          <span className="zd-label">$TICK</span>
          <span>{breadth.tick}</span>
          <span className="muted">$ADD {breadth.add}</span>
        </div>
      )}
    </div>
  );
}
