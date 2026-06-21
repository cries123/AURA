import type { LiquidityLevel } from "../types";

export interface LevelPair {
  timeframe: string;
  eql: LiquidityLevel | null;
  eqh: LiquidityLevel | null;
  range?: number | null;
  mid?: number | null;
  combined_score?: number;
}

export function buildLevelPairs(
  levels: LiquidityLevel[],
  lastPrice?: number
): LevelPair[] {
  const price = lastPrice ?? 0;
  const byTf: Record<string, { eql: LiquidityLevel[]; eqh: LiquidityLevel[] }> = {};

  for (const level of levels) {
    const tf = level.timeframe;
    if (!byTf[tf]) byTf[tf] = { eql: [], eqh: [] };
    if (level.level_type === "EQL") byTf[tf].eql.push(level);
    if (level.level_type === "EQH") byTf[tf].eqh.push(level);
  }

  const order = ["1m", "5m", "15m", "1h", "4h", "1d"];
  const pairs: LevelPair[] = [];

  for (const tf of order) {
    const sides = byTf[tf];
    if (!sides) continue;
    const eql = pickEql(sides.eql, price);
    const eqh = pickEqh(sides.eqh, price);
    if (!eql && !eqh) continue;

    const range =
      eql && eqh ? Math.round((eqh.price - eql.price) * 100) / 100 : null;
    const mid = eql && eqh ? Math.round(((eqh.price + eql.price) / 2) * 100) / 100 : null;

    pairs.push({
      timeframe: tf,
      eql,
      eqh,
      range,
      mid,
      combined_score: (eql?.score ?? 0) + (eqh?.score ?? 0),
    });
  }

  return pairs;
}

function pickEql(levels: LiquidityLevel[], price: number): LiquidityLevel | null {
  if (!levels.length) return null;
  const below = levels.filter((l) => l.price <= price);
  if (below.length) return below.reduce((a, b) => (a.price > b.price ? a : b));
  return levels.reduce((a, b) =>
    Math.abs(a.price - price) < Math.abs(b.price - price) ? a : b
  );
}

function pickEqh(levels: LiquidityLevel[], price: number): LiquidityLevel | null {
  if (!levels.length) return null;
  const above = levels.filter((l) => l.price >= price);
  if (above.length) return above.reduce((a, b) => (a.price < b.price ? a : b));
  return levels.reduce((a, b) =>
    Math.abs(a.price - price) < Math.abs(b.price - price) ? a : b
  );
}

export function pairForTimeframe(
  pairs: LevelPair[],
  timeframe: string
): LevelPair | undefined {
  return pairs.find((p) => p.timeframe === timeframe);
}
