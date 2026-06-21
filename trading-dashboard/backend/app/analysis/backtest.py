from __future__ import annotations

import pandas as pd

from app.analysis.patterns import detect_liquidity_levels, detect_sweep_reclaim


def backtest_rule(
    df: pd.DataFrame,
    rule: str = "eql_sweep_reclaim",
    tolerance_pct: float = 0.15,
) -> dict:
    if df.empty or len(df) < 50:
        return {"rule": rule, "trades": 0, "win_rate": None, "avg_move_15b": None, "note": "insufficient data"}

    levels = detect_liquidity_levels("X", "5m", df.iloc[:-30], tolerance_pct, 2, 5)
    eql_levels = [l for l in levels if l.level_type == "EQL"]

    wins = 0
    trades = 0
    moves = []

    for i in range(30, len(df) - 15):
        window = df.iloc[: i + 1]
        last = float(window["close"].iloc[-1])
        for lvl in eql_levels:
            if abs(last - lvl.price) / lvl.price * 100 > 0.2:
                continue
            sweep = detect_sweep_reclaim(window.tail(5), lvl.price, "EQL", tolerance_pct)
            if rule == "eql_sweep_reclaim" and not sweep:
                continue
            future = df.iloc[i + 1 : i + 16]
            if future.empty:
                continue
            entry = last
            exit_p = float(future["close"].iloc[-1])
            move = exit_p - entry
            moves.append(move)
            trades += 1
            if move > 0:
                wins += 1
            break

    return {
        "rule": rule,
        "trades": trades,
        "win_rate": round(wins / trades * 100, 1) if trades else None,
        "avg_move_15b": round(sum(moves) / len(moves), 3) if moves else None,
        "note": None,
    }
