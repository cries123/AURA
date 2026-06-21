import type { ZeroDTEContext } from "../types";

interface ChainHeatmapProps {
  zerodte: ZeroDTEContext | null | undefined;
}

export function ChainHeatmap({ zerodte }: ChainHeatmapProps) {
  const chain = zerodte?.chain;
  if (!chain?.strikes?.length) {
    return (
      <div className="panel">
        <h3>0DTE Chain</h3>
        <p className="muted">No chain data — select SPY, QQQ, or SPX.</p>
      </div>
    );
  }

  const maxOi = Math.max(...chain.strikes.map((s) => Math.max(s.call_oi, s.put_oi)));

  return (
    <div className="panel chain-panel">
      <div className="panel-header">
        <h3>0DTE Chain Heatmap</h3>
        <span className="muted">{chain.expiry}</span>
      </div>
      <div className="chain-meta">
        <span>EM ${chain.expected_move}</span>
        <span>Max pain {chain.max_pain}</span>
        <span>GEX {chain.gex?.regime}</span>
        <span>Flip {chain.gex?.gamma_flip_estimate}</span>
      </div>
      <div className="chain-table">
        <div className="chain-row header">
          <span>Strike</span>
          <span>Call OI</span>
          <span>Put OI</span>
          <span>Vol</span>
        </div>
        {chain.strikes.map((s) => (
          <div
            key={s.strike}
            className={`chain-row ${s.at_liquidity_level ? "at-level" : ""} ${s.wall ? "wall" : ""}`}
          >
            <span>{s.strike}</span>
            <span>
              <span className="oi-bar call" style={{ width: `${(s.call_oi / maxOi) * 100}%` }} />
              {s.call_oi}
            </span>
            <span>
              <span className="oi-bar put" style={{ width: `${(s.put_oi / maxOi) * 100}%` }} />
              {s.put_oi}
            </span>
            <span>{s.call_volume + s.put_volume}</span>
          </div>
        ))}
      </div>
      {chain.note && <p className="note">{chain.note}</p>}
    </div>
  );
}
