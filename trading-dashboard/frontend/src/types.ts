export interface LiquidityLevel {
  symbol: string;
  timeframe: string;
  level_type: "EQL" | "EQH";
  price: number;
  touches: number;
  score: number;
  score_factors: string[];
  structure?: string;
  session_label?: string;
  proximity?: boolean;
  acceptance?: boolean;
  sweep_reclaim?: Record<string, unknown> | null;
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
  note?: string | null;
}

export interface Snapshot {
  symbol: string;
  last_price?: number;
  cluster?: string;
  confluence_score?: number;
  quote?: {
    last?: number;
    change?: number;
    change_pct?: number;
  };
  structures?: Record<
    string,
    { structure: string; last_swing_high?: number; last_swing_low?: number }
  >;
  levels: LiquidityLevel[];
  dealing_range?: {
    high?: number;
    low?: number;
    equilibrium?: number;
    premium_discount?: string;
  };
  fvgs?: Array<{ type: string; top: number; bottom: number; time: string }>;
  options_context?: OptionsContext;
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
}

export interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
