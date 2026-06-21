export type IndicatorKey =
  | "eql_eqh"
  | "bracket_mid"
  | "vwap"
  | "or15"
  | "or5"
  | "premarket"
  | "prior_day"
  | "max_pain"
  | "equilibrium";

export type IndicatorToggles = Record<IndicatorKey, boolean>;

export const INDICATOR_LABELS: Record<IndicatorKey, string> = {
  eql_eqh: "EQL / EQH",
  bracket_mid: "Bracket Mid",
  vwap: "VWAP",
  or15: "OR15",
  or5: "OR5",
  premarket: "Premarket",
  prior_day: "Prior Day",
  max_pain: "Max Pain",
  equilibrium: "Equilibrium",
};

export const DEFAULT_INDICATORS: IndicatorToggles = {
  eql_eqh: true,
  bracket_mid: true,
  vwap: true,
  or15: true,
  or5: false,
  premarket: false,
  prior_day: false,
  max_pain: true,
  equilibrium: false,
};

const STORAGE_KEY = "liquidity-dashboard-indicators";

export function loadIndicatorToggles(): IndicatorToggles {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_INDICATORS };
    return { ...DEFAULT_INDICATORS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_INDICATORS };
  }
}

export function saveIndicatorToggles(toggles: IndicatorToggles): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toggles));
  } catch {
    /* ignore */
  }
}
