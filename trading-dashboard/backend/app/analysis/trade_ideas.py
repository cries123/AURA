from __future__ import annotations


def generate_trade_idea(
    symbol: str,
    level: dict,
    last_price: float,
    chain: dict,
    vwap_ctx: dict,
    session_levels: dict,
) -> dict | None:
    if not level:
        return None

    level_type = level.get("level_type")
    score = level.get("score", 0)
    if score < 5:
        return None

    nearest_strike = None
    if chain.get("strikes"):
        nearest_strike = min(chain["strikes"], key=lambda r: abs(r["strike"] - level["price"]))["strike"]

    strike = nearest_strike or round(level["price"])
    width = 2 if symbol in ("SPY", "QQQ") else 1

    if level_type == "EQL" and (level.get("sweep_reclaim") or level.get("proximity")):
        return {
            "structure": "bull_put_spread",
            "bias": "bullish",
            "description": f"Bull put spread below EQL {level['price']:.2f}",
            "short_strike": strike - width,
            "long_strike": strike - width * 2,
            "max_loss_estimate": width * 100,
            "breakeven_estimate": strike - width - 0.5,
            "risk_pct_account": 1.0,
            "filters": _filters(level, vwap_ctx, session_levels),
        }

    if level_type == "EQH" and (level.get("sweep_reclaim") or level.get("proximity")):
        return {
            "structure": "bear_call_spread",
            "bias": "bearish",
            "description": f"Bear call spread above EQH {level['price']:.2f}",
            "short_strike": strike + width,
            "long_strike": strike + width * 2,
            "max_loss_estimate": width * 100,
            "breakeven_estimate": strike + width + 0.5,
            "risk_pct_account": 1.0,
            "filters": _filters(level, vwap_ctx, session_levels),
        }

    return None


def _filters(level: dict, vwap_ctx: dict, session_levels: dict) -> list[str]:
    f = list(level.get("score_factors") or [])
    if vwap_ctx.get("position"):
        f.append(f"VWAP {vwap_ctx['position']}")
    for key in ("or_15m_high", "or_15m_low", "premarket_high"):
        if session_levels.get(key) and level.get("price"):
            if abs(session_levels[key] - level["price"]) / level["price"] * 100 < 0.2:
                f.append(f"aligns {key}")
    return f
