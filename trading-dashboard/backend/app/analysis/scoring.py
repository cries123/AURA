from __future__ import annotations

from app.analysis.patterns import LiquidityLevel, MarketStructure


def score_level(
    level: LiquidityLevel,
    all_levels: list[LiquidityLevel],
    structure: MarketStructure | None,
    has_sweep_reclaim: bool,
    is_proximity: bool,
    has_acceptance: bool,
    zerodte_bonus: int = 0,
    extra_factors: list[str] | None = None,
) -> tuple[int, list[str]]:
    score = 0
    factors: list[str] = list(extra_factors or [])

    if level.touches >= 3:
        score += 2
        factors.append(f"{level.touches} touches")

    # Multi-timeframe confluence
    confluent = [
        other
        for other in all_levels
        if other.symbol == level.symbol
        and other.level_type == level.level_type
        and other.timeframe != level.timeframe
        and other.price != 0
        and abs(other.price - level.price) / level.price * 100 <= 0.2
    ]
    if confluent:
        score += min(3, len(confluent) + 1)
        factors.append(f"{len(confluent) + 1} TF confluence")

    if has_sweep_reclaim:
        score += 2
        factors.append("sweep + reclaim")

    if is_proximity:
        score += 1
        factors.append("price at level")

    if structure:
        if level.level_type == "EQL" and structure.structure == "bullish":
            score += 2
            factors.append("HTF bullish structure")
        elif level.level_type == "EQH" and structure.structure == "bearish":
            score += 2
            factors.append("HTF bearish structure")
        elif structure.structure == "ranging":
            score += 1
            factors.append("ranging structure")

    if has_acceptance:
        score += 1
        factors.append("acceptance beyond level")

    if zerodte_bonus:
        score += zerodte_bonus

    return score, factors


def aggregate_confluence_score(levels: list[LiquidityLevel], primary_tf: str) -> int:
    primary = [l for l in levels if l.timeframe == primary_tf]
    if not primary:
        return 0
    return max(
        (
            len(
                [
                    o
                    for o in levels
                    if o.level_type == l.level_type
                    and abs(o.price - l.price) / l.price * 100 <= 0.2
                ]
            )
            for l in primary
        ),
        default=0,
    )
