from __future__ import annotations

TF_ORDER = {"1m": 0, "5m": 1, "15m": 2, "1h": 3, "4h": 4, "1d": 5}


def build_level_pairs(levels: list[dict], last_price: float | None) -> list[dict]:
    """Pair nearest EQL + EQH per timeframe (active liquidity bracket)."""
    if not levels:
        return []

    price = last_price or 0
    by_tf: dict[str, dict[str, list[dict]]] = {}

    for level in levels:
        tf = level.get("timeframe", "")
        kind = (level.get("level_type") or "").lower()
        if kind not in ("eql", "eqh"):
            continue
        by_tf.setdefault(tf, {"eql": [], "eqh": []})
        by_tf[tf][kind].append(level)

    pairs: list[dict] = []
    for tf, sides in by_tf.items():
        eqls = sides["eql"]
        eqhs = sides["eqh"]
        if not eqls and not eqhs:
            continue

        eql = _pick_eql(eqls, price)
        eqh = _pick_eqh(eqhs, price)

        range_size = None
        mid = None
        if eql and eqh:
            range_size = round(eqh["price"] - eql["price"], 2)
            mid = round((eqh["price"] + eql["price"]) / 2, 2)

        pairs.append({
            "timeframe": tf,
            "eql": eql,
            "eqh": eqh,
            "range": range_size,
            "mid": mid,
            "combined_score": (eql or {}).get("score", 0) + (eqh or {}).get("score", 0),
        })

    return sorted(pairs, key=lambda p: TF_ORDER.get(p["timeframe"], 99))


def sort_levels_paired(levels: list[dict]) -> list[dict]:
    """Sort levels so EQL and EQH for each timeframe are adjacent."""
    pairs = build_level_pairs(levels, _median_price(levels))
    ordered: list[dict] = []
    seen: set[str] = set()

    for pair in pairs:
        for side in ("eql", "eqh"):
            level = pair.get(side)
            if not level:
                continue
            key = f"{level['timeframe']}:{level['level_type']}:{level['price']}"
            if key not in seen:
                ordered.append(level)
                seen.add(key)

    for level in sorted(levels, key=lambda x: x.get("score", 0), reverse=True):
        key = f"{level['timeframe']}:{level['level_type']}:{level['price']}"
        if key not in seen:
            ordered.append(level)
            seen.add(key)

    return ordered


def _pick_eql(eqls: list[dict], price: float) -> dict | None:
    if not eqls:
        return None
    below = [e for e in eqls if e["price"] <= price]
    if below:
        return max(below, key=lambda e: e["price"])
    return min(eqls, key=lambda e: abs(e["price"] - price))


def _pick_eqh(eqhs: list[dict], price: float) -> dict | None:
    if not eqhs:
        return None
    above = [e for e in eqhs if e["price"] >= price]
    if above:
        return min(above, key=lambda e: e["price"])
    return min(eqhs, key=lambda e: abs(e["price"] - price))


def _median_price(levels: list[dict]) -> float:
    prices = [l["price"] for l in levels if l.get("price")]
    if not prices:
        return 0
    prices.sort()
    return prices[len(prices) // 2]
