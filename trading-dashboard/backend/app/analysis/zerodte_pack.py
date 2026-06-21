from __future__ import annotations

from app.analysis.breadth import fetch_breadth
from app.analysis.events import get_event_context, is_power_hour
from app.analysis.session_levels import compute_session_levels, levels_near_price
from app.analysis.trade_ideas import generate_trade_idea
from app.analysis.velocity import approach_velocity, time_at_level
from app.analysis.vwap import anchored_vwap, vwap_context
from app.analysis.zerodte_options import build_chain_heatmap, em_consumed, pin_risk
from app.analysis.candle_patterns import detect_candle_patterns
from app.analysis.backtest import backtest_rule
from app.watchlist import ZERODTE_SYMBOLS


def build_zerodte_context(
    symbol: str,
    last_price: float,
    bars_1m,
    bars_5m,
    scored_levels: list[dict],
    open_price: float | None = None,
) -> dict | None:
    if symbol not in ZERODTE_SYMBOLS:
        return None

    level_prices = [l["price"] for l in scored_levels]
    session = compute_session_levels(bars_5m if not bars_5m.empty else bars_1m)
    vwap = vwap_context(bars_5m if not bars_5m.empty else bars_1m, last_price)
    avwap = anchored_vwap(bars_5m if not bars_5m.empty else bars_1m, 0)

    chain = build_chain_heatmap(symbol, last_price, level_prices)
    em = em_consumed(last_price, open_price or last_price, chain.get("expected_move"))

    nearest = min(scored_levels, key=lambda x: x.get("distance_pct") or 999) if scored_levels else None
    patterns = []
    velocity = {}
    time_level = {}
    if nearest and not bars_5m.empty:
        patterns = detect_candle_patterns(bars_5m, nearest["price"], nearest["level_type"])
        velocity = approach_velocity(bars_5m, nearest["price"])
        time_level = time_at_level(bars_5m, nearest["price"])

    trade_idea = generate_trade_idea(symbol, nearest or {}, last_price, chain, vwap, session) if nearest else None
    backtest = backtest_rule(bars_5m) if not bars_5m.empty else {"trades": 0}

    session_hits = levels_near_price(session, last_price) if session else []

    return {
        "session_levels": session,
        "session_level_hits": session_hits,
        "vwap": vwap,
        "anchored_vwap": avwap,
        "chain": chain,
        "em_consumed": em,
        "pin_risk": pin_risk(last_price, chain.get("max_pain")),
        "candle_patterns": patterns,
        "velocity": velocity,
        "time_at_level": time_level,
        "trade_idea": trade_idea,
        "backtest": backtest,
        "events": get_event_context(),
        "breadth": fetch_breadth(),
        "is_power_hour": is_power_hour(),
    }


def classify_alert_tier(score: int, level: dict, symbol: str, zerodte: dict | None) -> str:
    has_sweep = bool(level.get("sweep_reclaim"))
    patterns = (zerodte or {}).get("candle_patterns") or []
    high_quality = has_sweep or bool(patterns)

    if symbol in ZERODTE_SYMBOLS and score >= 8 and high_quality:
        return "A"
    if score >= 5:
        return "B"
    return "C"
