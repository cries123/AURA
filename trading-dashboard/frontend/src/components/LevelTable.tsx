import type { LiquidityLevel, Snapshot } from "../types";
import { buildLevelPairs } from "../lib/levelPairs";

interface LevelTableProps {
  snapshot: Snapshot | null;
  onSelectLevel: (level: LiquidityLevel) => void;
  selectedLevel: LiquidityLevel | null;
}

export function LevelTable({ snapshot, onSelectLevel, selectedLevel }: LevelTableProps) {
  if (!snapshot?.levels?.length) {
    return (
      <div className="panel level-panel">
        <h3>EQL / EQH Brackets</h3>
        <p className="muted">No levels detected yet.</p>
      </div>
    );
  }

  const pairs = snapshot.level_pairs ?? buildLevelPairs(snapshot.levels, snapshot.last_price);

  return (
    <div className="panel level-panel">
      <div className="panel-header">
        <h3>EQL / EQH Brackets</h3>
        <span className="muted">{pairs.length} timeframes</span>
      </div>
      <div className="pair-table">
        <div className="pair-row header">
          <span>TF</span>
          <span>EQL</span>
          <span>EQH</span>
          <span>Range</span>
          <span>Score</span>
        </div>
        {pairs.map((pair) => (
          <div
            key={pair.timeframe}
            className={`pair-row ${pair.bracket_valid === false ? "pair-invalid" : ""}`}
          >
            <span className="tf-cell">
              {pair.timeframe.toUpperCase()}
              {pair.bracket_valid === false && (
                <span className="validity-badge stale">stale</span>
              )}
            </span>
            <PairCell
              level={pair.eql}
              type="EQL"
              selectedLevel={selectedLevel}
              onSelect={onSelectLevel}
            />
            <PairCell
              level={pair.eqh}
              type="EQH"
              selectedLevel={selectedLevel}
              onSelect={onSelectLevel}
            />
            <span className="range-cell">
              {pair.range != null ? `$${pair.range.toFixed(2)}` : "—"}
            </span>
            <span className="score-badge">{pair.combined_score ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PairCell({
  level,
  type,
  selectedLevel,
  onSelect,
}: {
  level: LiquidityLevel | null;
  type: "EQL" | "EQH";
  selectedLevel: LiquidityLevel | null;
  onSelect: (l: LiquidityLevel) => void;
}) {
  if (!level) {
    return <span className="pair-cell empty">—</span>;
  }

  const isSelected = selectedLevel === level;

  return (
    <button
      type="button"
      className={`pair-cell ${type === "EQH" ? "eqh" : "eql"} ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(level)}
    >
      <span className="pair-price">{level.price.toFixed(2)}</span>
      <span className="pair-meta">
        {level.touches}t · {level.distance_pct?.toFixed(2) ?? "—"}%
      </span>
      {level.validity && (
        <span className={`validity-badge ${level.validity.status}`}>
          {level.validity.status}
        </span>
      )}
      <span className="flags">
        {level.proximity && <span className="flag prox">NEAR</span>}
        {level.sweep_reclaim && <span className="flag sweep">SWP</span>}
      </span>
    </button>
  );
}
