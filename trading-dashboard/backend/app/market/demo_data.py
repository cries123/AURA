"""Demo snapshots when live market data is unavailable (e.g. offline dev)."""

from __future__ import annotations

from datetime import datetime

from app.watchlist import WATCHLIST


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
                "primary_timeframe": "1h",
                "updated_at": datetime.utcnow().isoformat(),
            }
        )
    return snapshots


def _cluster_for(symbol: str) -> str:
    from app.watchlist import CORRELATION_CLUSTERS

    for name, symbols in CORRELATION_CLUSTERS.items():
        if symbol in symbols:
            return name
    return "other"
