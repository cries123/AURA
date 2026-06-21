export interface LiquidityLevel {
  symbol: string;
  timeframe: string;
  level_type: "EQL" | "EQH";
  price: number;
  touches: number;
  score: number;
  score_factors: string[];
  validity?: {
    is_valid: boolean;
    status: "valid" | "testing" | "stale" | "invalidated";
    reason?: string;
    bars_since_touch?: number;
  };
  structure?: string;
  session_label?: string;
  proximity?: boolean;
  acceptance?: boolean;
  sweep_reclaim?: Record<string, unknown> | null;
  candle_patterns?: Array<{ pattern: string; bias: string }>;
  velocity?: {
    velocity_pct_per_min?: number;
    velocity_dollars_per_min?: number;
    minutes_to_level?: number;
    approaching?: boolean;
    bars_at_level?: number;
    minutes_at_level?: number;
  };
  distance_pct?: number;
}

export interface OptionsContext {
  nearest_strike?: number | null;
  nearest_expiry?: string | null;
  dte?: number | null;
  iv_rank?: number | null;
  expected_move?: number | null;
  expected_move_pct?: number | null;
  distance_to_level?: number | null;
  distance_to_level_pct?: number | null;
  em_vs_distance_ratio?: number | null;
  em_consumed_pct?: number | null;
  max_pain?: number | null;
  note?: string | null;
}

export interface ZeroDTEContext {
  session_levels?: Record<string, number | null>;
  session_level_hits?: string[];
  vwap?: { vwap?: number; position?: string; distance_pct?: number };
  anchored_vwap?: { avwap?: number };
  chain?: {
    expiry?: string;
    is_0dte?: boolean;
    expected_move?: number;
    expected_move_pct?: number;
    max_pain?: number;
    gex?: { regime?: string; gamma_flip_estimate?: number; net_oi_bias?: number };
    strikes?: Array<{
      strike: number;
      call_oi: number;
      put_oi: number;
      call_volume: number;
      put_volume: number;
      at_liquidity_level?: boolean;
      wall?: boolean;
    }>;
    note?: string;
  };
  em_consumed?: { traveled?: number; consumed_pct?: number; remaining?: number };
  pin_risk?: { pin_risk?: string; distance_to_pin?: number; pull_direction?: string };
  candle_patterns?: Array<{ pattern: string; bias: string }>;
  velocity?: Record<string, unknown>;
  trade_idea?: TradeIdea;
  backtest?: { rule: string; trades: number; win_rate?: number; avg_move_15b?: number };
  events?: Record<string, unknown>;
  breadth?: { tick?: number; add?: number; vold?: number; bias?: string };
  is_power_hour?: boolean;
}

export interface TradeIdea {
  structure: string;
  bias: string;
  description: string;
  short_strike?: number;
  long_strike?: number;
  max_loss_estimate?: number;
  breakeven_estimate?: number;
  risk_pct_account?: number;
  filters?: string[];
}

export interface LevelPair {
  timeframe: string;
  eql: LiquidityLevel | null;
  eqh: LiquidityLevel | null;
  range?: number | null;
  mid?: number | null;
  combined_score?: number;
  bracket_valid?: boolean;
}

export interface Snapshot {
  symbol: string;
  last_price?: number;
  cluster?: string;
  confluence_score?: number;
  quote?: { last?: number; change?: number; change_pct?: number };
  structures?: Record<string, { structure: string; last_swing_high?: number; last_swing_low?: number }>;
  levels: LiquidityLevel[];
  level_pairs?: LevelPair[];
  dealing_range?: { high?: number; low?: number; equilibrium?: number; premium_discount?: string };
  fvgs?: Array<{ type: string; top: number; bottom: number; time: string }>;
  options_context?: OptionsContext;
  zerodte?: ZeroDTEContext | null;
  primary_timeframe?: string;
  updated_at?: string;
  error?: string;
}

export interface Alert {
  id: number;
  symbol: string;
  timeframe: string;
  event_type: string;
  level_type?: string;
  level_price?: number;
  message: string;
  score: number;
  score_factors: string[];
  options_context?: OptionsContext;
  created_at: string;
  notified: boolean;
  tier?: string;
}

export interface JournalEntry {
  id: number;
  alert_id?: number;
  symbol: string;
  setup?: string;
  level_price?: number;
  score?: number;
  tier?: string;
  notes?: string;
  created_at: string;
}

export interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DivergenceData {
  performance?: Record<string, number>;
  leader?: string;
  laggard?: string;
  divergences?: Array<{ symbol: string; state: string; change_pct: number }>;
  signals?: string[];
}

export interface BreadthData {
  tick?: number;
  add?: number;
  vold?: number;
  bias?: string;
  confirms_long?: boolean;
  confirms_short?: boolean;
  note?: string;
}

export interface EventsData {
  is_rth?: boolean;
  is_power_hour?: boolean;
  is_blocked_window?: boolean;
  today_events?: Array<{ name: string; impact: string }>;
}
