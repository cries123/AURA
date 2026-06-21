import type { LiquidityLevel, OptionsContext, Snapshot } from "../types";

interface OptionsPanelProps {
  snapshot: Snapshot | null;
  selectedLevel: LiquidityLevel | null;
}

export function OptionsPanel({ snapshot, selectedLevel }: OptionsPanelProps) {
  if (!snapshot) {
    return (
      <div className="panel options-panel">
        <h3>Options & Structure</h3>
        <p className="muted">Select a symbol to view details.</p>
      </div>
    );
  }

  const ctx: OptionsContext = snapshot.options_context ?? {};
  const level = selectedLevel ?? snapshot.levels?.[0] ?? null;
  const structure = snapshot.structures?.["1h"] ?? snapshot.structures?.["4h"];

  return (
    <div className="panel options-panel">
      <div className="panel-header">
        <h3>Options & Structure</h3>
        <span className="muted">{snapshot.symbol}</span>
      </div>

      <div className="options-grid">
        <Stat label="Nearest Strike" value={fmt(ctx.nearest_strike)} />
        <Stat label="Expiry / DTE" value={ctx.nearest_expiry ? `${ctx.nearest_expiry} (${ctx.dte}d)` : "—"} />
        <Stat label="IV Rank" value={ctx.iv_rank != null ? `${ctx.iv_rank}%` : "—"} />
        <Stat label="Expected Move" value={ctx.expected_move != null ? `$${ctx.expected_move}` : "—"} />
        <Stat label="Dist to Level" value={fmtPct(ctx.distance_to_level_pct)} />
        <Stat label="EM vs Distance" value={fmtRatio(ctx.em_vs_distance_ratio)} />
      </div>

      {ctx.note && <p className="note">{ctx.note}</p>}

      <div className="structure-block">
        <h4>Market Structure (1H)</h4>
        <p>
          <span className={`structure-pill ${structure?.structure ?? "unclear"}`}>
            {structure?.structure ?? "unclear"}
          </span>
        </p>
        {structure && (
          <div className="swing-levels">
            <span>SH: {structure.last_swing_high?.toFixed(2) ?? "—"}</span>
            <span>SL: {structure.last_swing_low?.toFixed(2) ?? "—"}</span>
          </div>
        )}
      </div>

      {snapshot.dealing_range && (
        <div className="structure-block">
          <h4>Dealing Range</h4>
          <div className="swing-levels">
            <span>High: {snapshot.dealing_range.high?.toFixed(2) ?? "—"}</span>
            <span>EQ: {snapshot.dealing_range.equilibrium?.toFixed(2) ?? "—"}</span>
            <span>Low: {snapshot.dealing_range.low?.toFixed(2) ?? "—"}</span>
            <span className="pd-zone">{snapshot.dealing_range.premium_discount ?? "—"}</span>
          </div>
        </div>
      )}

      {level && (
        <div className="structure-block">
          <h4>Selected Level</h4>
          <p>
            <strong>{level.level_type}</strong> @ {level.price.toFixed(2)} ({level.timeframe})
          </p>
          <p className="muted">{level.score_factors?.join(" · ")}</p>
          {level.session_label && <p className="muted">Session: {level.session_label}</p>}
        </div>
      )}

      {snapshot.fvgs && snapshot.fvgs.length > 0 && (
        <div className="structure-block">
          <h4>Fair Value Gaps</h4>
          <ul className="fvg-list">
            {snapshot.fvgs.slice(-5).map((fvg, i) => (
              <li key={i}>
                {fvg.type} {fvg.bottom.toFixed(2)} – {fvg.top.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function fmt(v?: number | null): string {
  return v != null ? v.toFixed(2) : "—";
}

function fmtPct(v?: number | null): string {
  return v != null ? `${v.toFixed(3)}%` : "—";
}

function fmtRatio(v?: number | null): string {
  return v != null ? `${v.toFixed(2)}x` : "—";
}
