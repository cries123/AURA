"""Demo snapshots when live market data is unavailable (e.g. offline dev)."""

from __future__ import annotations

from datetime import datetime

from app.watchlist import WATCHLIST, ZERODTE_SYMBOLS


def build_demo_snapshots() -> list[dict]:
    base_prices = {
        "QQQ": 512.34,
        "SPY": 585.20,
        "SPX": 7500.57,
        "INTC": 133.99,
        "CRWV": 42.15,
        "MRVL": 78.50,
        "HOOD": 28.75,
        "MSTR": 112.40,
        "ORCL": 178.25,
        "PLTR": 45.80,
        "SPCX": 18.30,
        "RIVN": 14.55,
        "IMSR": 6.20,
        "RDW": 9.85,
    }

    snapshots = []
    for symbol in WATCHLIST:
        last = base_prices.get(symbol, 100.0)
        eql = round(last * 0.985, 2)
        eqh = round(last * 1.015, 2)

        snapshots.append(
            {
                "symbol": symbol,
                "quote": {"last": last, "change": 1.25, "change_pct": 0.85},
                "last_price": last,
                "cluster": _cluster_for(symbol),
                "confluence_score": 3,
                "structures": {
                    "1h": {"structure": "bullish", "last_swing_high": eqh, "last_swing_low": eql},
                    "4h": {"structure": "ranging", "last_swing_high": eqh * 1.01, "last_swing_low": eql * 0.99},
                },
                "levels": [
                    {
                        "symbol": symbol,
                        "timeframe": "1h",
                        "level_type": "EQL",
                        "price": eql,
                        "touches": 3,
                        "touch_timestamps": [],
                        "first_touch": datetime.utcnow().isoformat(),
                        "last_touch": datetime.utcnow().isoformat(),
                        "session": "ny_rth",
                        "score": 7,
                        "score_factors": ["3 touches", "2 TF confluence", "HTF bullish structure"],
                        "structure": "bullish",
                        "session_label": "NY RTH",
                        "sweep_reclaim": None,
                        "proximity": abs(last - eql) / eql * 100 < 0.5,
                        "acceptance": False,
                        "distance_pct": round(abs(last - eql) / eql * 100, 3),
                        "validity": {"is_valid": True, "status": "valid", "reason": "untested", "bars_since_touch": 5},
                        "updated_at": datetime.utcnow().isoformat(),
                    },
                    {
                        "symbol": symbol,
                        "timeframe": "1h",
                        "level_type": "EQH",
                        "price": eqh,
                        "touches": 2,
                        "touch_timestamps": [],
                        "first_touch": datetime.utcnow().isoformat(),
                        "last_touch": datetime.utcnow().isoformat(),
                        "session": "london",
                        "score": 5,
                        "score_factors": ["2 touches", "ranging structure"],
                        "structure": "bullish",
                        "session_label": "London",
                        "sweep_reclaim": None,
                        "proximity": False,
                        "acceptance": False,
                        "distance_pct": round(abs(last - eqh) / eqh * 100, 3),
                        "validity": {"is_valid": True, "status": "valid", "reason": "holding", "bars_since_touch": 8},
                        "updated_at": datetime.utcnow().isoformat(),
                    },
                ],
                "dealing_range": {
                    "high": eqh,
                    "low": eql,
                    "equilibrium": round((eqh + eql) / 2, 2),
                    "premium_discount": "premium" if last > (eqh + eql) / 2 else "discount",
                },
                "fvgs": [
                    {"type": "bullish", "top": round(last * 0.995, 2), "bottom": round(last * 0.99, 2), "time": datetime.utcnow().isoformat()}
                ],
                "options_context": {
                    "nearest_strike": round(eqh),
                    "nearest_expiry": "2026-06-27",
                    "dte": 6,
                    "iv_rank": 42.5,
                    "expected_move": round(last * 0.02, 2),
                    "expected_move_pct": 2.0,
                    "distance_to_level": round(last - eql, 2),
                    "distance_to_level_pct": round(abs(last - eql) / eql * 100, 3),
                    "em_vs_distance_ratio": 1.2,
                    "note": "Demo data — connect live feed for real values",
                },
                "primary_timeframe": "5m" if symbol in ZERODTE_SYMBOLS else "1h",
                "zerodte": _demo_zerodte(symbol, last, eql, eqh) if symbol in ZERODTE_SYMBOLS else None,
                "updated_at": datetime.utcnow().isoformat(),
            }
        )
    return snapshots


def _demo_zerodte(symbol: str, last: float, eql: float, eqh: float) -> dict:
    em = round(last * 0.012, 2)
    return {
        "session_levels": {
            "prior_day_high": eqh * 1.01,
            "prior_day_low": eql * 0.99,
            "prior_day_close": last,
            "premarket_high": eqh,
            "premarket_low": eql,
            "or_5m_high": eqh * 0.998,
            "or_5m_low": eql * 1.002,
            "or_15m_high": eqh,
            "or_15m_low": eql,
        },
        "session_level_hits": ["or_15m_low"],
        "vwap": {"vwap": round(last * 0.998, 2), "position": "above", "distance_pct": 0.2},
        "anchored_vwap": {"anchor_time": datetime.utcnow().isoformat(), "avwap": round(last * 0.997, 2)},
        "chain": {
            "expiry": datetime.utcnow().strftime("%Y-%m-%d"),
            "is_0dte": True,
            "expected_move": em,
            "expected_move_pct": round(em / last * 100, 2),
            "max_pain": round(last),
            "gex": {"net_oi_bias": 1200, "regime": "positive", "gamma_flip_estimate": round(last * 0.995, 2)},
            "strikes": [
                {"strike": round(last) + i, "call_oi": 4000 - i * 200, "put_oi": 3500 + i * 150,
                 "call_volume": 900, "put_volume": 800, "net_oi": 500, "at_liquidity_level": i == 0, "wall": i == 0}
                for i in range(-3, 4)
            ],
            "note": "Demo 0DTE chain",
        },
        "em_consumed": {"traveled": round(last * 0.008, 2), "consumed_pct": 68.0, "remaining": round(em * 0.32, 2)},
        "pin_risk": {"pin_risk": "normal", "distance_to_pin": 0.5, "pull_direction": "at_pin"},
        "candle_patterns": [{"pattern": "bullish_engulfing", "bias": "bullish"}],
        "velocity": {"velocity_pct_per_min": 0.02, "velocity_dollars_per_min": 0.08, "minutes_to_level": 4.5, "approaching": True},
        "time_at_level": {"bars_at_level": 2, "minutes_at_level": 10},
        "trade_idea": {
            "structure": "bull_put_spread",
            "bias": "bullish",
            "description": f"Bull put spread below EQL {eql:.2f}",
            "short_strike": round(eql) - 2,
            "long_strike": round(eql) - 4,
            "max_loss_estimate": 200,
            "breakeven_estimate": round(eql) - 2.5,
            "risk_pct_account": 1.0,
            "filters": ["3 touches", "above VWAP at EQL"],
        },
        "backtest": {"rule": "eql_sweep_reclaim", "trades": 24, "win_rate": 62.5, "avg_move_15b": 0.42},
        "events": {"is_rth": True, "is_power_hour": False, "is_blocked_window": False, "today_events": []},
        "breadth": {"tick": 412, "add": 628, "vold": 0.82, "bias": "risk_on", "confirms_long": True},
        "is_power_hour": False,
    }


def _cluster_for(symbol: str) -> str:
    from app.watchlist import CORRELATION_CLUSTERS

    for name, symbols in CORRELATION_CLUSTERS.items():
        if symbol in symbols:
            return name
    return "other"
