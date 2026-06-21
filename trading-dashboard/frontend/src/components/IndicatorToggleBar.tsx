import type { IndicatorKey, IndicatorToggles } from "../lib/indicatorToggles";
import { INDICATOR_LABELS } from "../lib/indicatorToggles";

interface IndicatorToggleBarProps {
  toggles: IndicatorToggles;
  onChange: (key: IndicatorKey, enabled: boolean) => void;
  onReset: () => void;
}

const ORDER: IndicatorKey[] = [
  "eql_eqh",
  "bracket_mid",
  "vwap",
  "or15",
  "or5",
  "premarket",
  "prior_day",
  "max_pain",
  "equilibrium",
];

export function IndicatorToggleBar({ toggles, onChange, onReset }: IndicatorToggleBarProps) {
  return (
    <div className="indicator-bar">
      <span className="indicator-bar-label">Indicators</span>
      {ORDER.map((key) => (
        <button
          key={key}
          type="button"
          className={`indicator-toggle ${toggles[key] ? "on" : "off"} ind-${key}`}
          onClick={() => onChange(key, !toggles[key])}
          title={`Toggle ${INDICATOR_LABELS[key]}`}
        >
          {INDICATOR_LABELS[key]}
        </button>
      ))}
      <button type="button" className="indicator-reset" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
