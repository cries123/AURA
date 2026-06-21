import type { LiquidityLevel, Snapshot } from "../types";

interface LevelTableProps {
  snapshot: Snapshot | null;
  onSelectLevel: (level: LiquidityLevel) => void;
  selectedLevel: LiquidityLevel | null;
}

export function LevelTable({ snapshot, onSelectLevel, selectedLevel }: LevelTableProps) {
  if (!snapshot?.levels?.length) {
    return (
      <div className="panel level-panel">
        <h3>EQL / EQH Levels</h3>
        <p className="muted">No levels detected yet.</p>
      </div>
    );
  }

  return (
    <div className="panel level-panel">
      <div className="panel-header">
        <h3>EQL / EQH Levels</h3>
        <span className="muted">{snapshot.levels.length} levels</span>
      </div>
      <div className="level-table">
        <div className="level-row header">
          <span>TF</span>
          <span>Type</span>
          <span>Price</span>
          <span>Touches</span>
          <span>Score</span>
          <span>Dist%</span>
          <span>Flags</span>
        </div>
        {snapshot.levels.map((level, i) => (
          <button
            key={`${level.timeframe}-${level.level_type}-${level.price}-${i}`}
            className={`level-row ${selectedLevel === level ? "selected" : ""}`}
            onClick={() => onSelectLevel(level)}
          >
            <span>{level.timeframe}</span>
            <span className={level.level_type === "EQH" ? "eqh" : "eql"}>{level.level_type}</span>
            <span>{level.price.toFixed(2)}</span>
            <span>{level.touches}</span>
            <span className="score-badge">{level.score}</span>
            <span>{level.distance_pct?.toFixed(3) ?? "—"}</span>
            <span className="flags">
              {level.proximity && <span className="flag prox">NEAR</span>}
              {level.sweep_reclaim && <span className="flag sweep">SWP</span>}
              {level.acceptance && <span className="flag acc">ACC</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
