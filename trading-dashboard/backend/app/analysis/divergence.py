from __future__ import annotations


def compute_index_divergence(snapshots: list[dict]) -> dict:
    index_snaps = {s["symbol"]: s for s in snapshots if s.get("symbol") in ("SPY", "QQQ", "SPX")}
    if len(index_snaps) < 2:
        return {"leader": None, "laggard": None, "divergences": [], "signals": []}

    perf = {}
    for sym, snap in index_snaps.items():
        perf[sym] = snap.get("quote", {}).get("change_pct") or 0

    leader = max(perf, key=perf.get)
    laggard = min(perf, key=perf.get)

    divergences = []
    signals = []

    for sym, snap in index_snaps.items():
        levels = snap.get("levels", [])
        prox_eqh = [l for l in levels if l.get("level_type") == "EQH" and l.get("proximity")]
        prox_eql = [l for l in levels if l.get("level_type") == "EQL" and l.get("proximity")]
        if prox_eqh:
            divergences.append({"symbol": sym, "state": "at_EQH", "change_pct": perf[sym]})
        if prox_eql:
            divergences.append({"symbol": sym, "state": "at_EQL", "change_pct": perf[sym]})

    eqh_syms = {d["symbol"] for d in divergences if d["state"] == "at_EQH"}
    eql_syms = {d["symbol"] for d in divergences if d["state"] == "at_EQL"}

    if "SPY" in eqh_syms and "QQQ" not in eqh_syms:
        signals.append("SPY at EQH but QQQ lagging — potential fade on SPY")
    if "QQQ" in eql_syms and "SPY" not in eql_syms:
        signals.append("QQQ at EQL but SPY holding — watch for catch-down")

    return {
        "performance": perf,
        "leader": leader,
        "laggard": laggard,
        "divergences": divergences,
        "signals": signals,
    }
