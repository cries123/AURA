from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.market.demo_data import build_demo_snapshots
from app.market.market_data import fetch_ohlcv
from app.db import database as db
from app.scanner import scanner
from app.watchlist import CORRELATION_CLUSTERS, WATCHLIST, TIMEFRAMES

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/watchlist")
async def get_watchlist():
    return {"symbols": WATCHLIST, "clusters": CORRELATION_CLUSTERS, "timeframes": TIMEFRAMES}


@router.get("/snapshots")
async def get_snapshots():
    snapshots = db.get_latest_snapshots()
    return {"snapshots": snapshots, "count": len(snapshots)}


@router.get("/snapshots/{symbol}")
async def get_snapshot(symbol: str):
    symbol = symbol.upper()
    snapshots = db.get_latest_snapshots()
    match = next((s for s in snapshots if s.get("symbol") == symbol), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"No snapshot for {symbol}")
    return match


@router.get("/levels")
async def get_levels(
    symbol: str | None = None,
    timeframe: str | None = None,
):
    return {"levels": db.get_levels(symbol=symbol, timeframe=timeframe)}


@router.get("/alerts")
async def get_alerts(
    limit: int = Query(100, ge=1, le=500),
    min_score: int = Query(0, ge=0, le=20),
):
    return {"alerts": db.get_alerts(limit=limit, min_score=min_score)}


@router.get("/bars/{symbol}")
async def get_bars(symbol: str, timeframe: str = "1h"):
    symbol = symbol.upper()
    if timeframe not in TIMEFRAMES:
        raise HTTPException(status_code=400, detail=f"Invalid timeframe. Use one of {TIMEFRAMES}")
    df = fetch_ohlcv(symbol, timeframe)
    if df.empty:
        bars = _demo_bars(symbol)
        return {"symbol": symbol, "timeframe": timeframe, "bars": bars, "demo": True}

    bars = [
        {
            "time": int(idx.timestamp()),
            "open": float(row["open"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "close": float(row["close"]),
            "volume": float(row["volume"]),
        }
        for idx, row in df.iterrows()
    ]
    return {"symbol": symbol, "timeframe": timeframe, "bars": bars}


def _demo_bars(symbol: str, count: int = 120) -> list[dict]:
    import math
    import time

    demos = {s["symbol"]: s["last_price"] for s in build_demo_snapshots()}
    price = demos.get(symbol.upper(), 100.0)
    now = int(time.time())
    bars = []
    p = price * 0.95
    for i in range(count):
        t = now - (count - i) * 3600
        drift = math.sin(i / 8) * 0.01
        o = p
        c = p * (1 + drift)
        h = max(o, c) * 1.005
        l = min(o, c) * 0.995
        bars.append({"time": t, "open": round(o, 2), "high": round(h, 2), "low": round(l, 2), "close": round(c, 2), "volume": 1_000_000})
        p = c
    return bars


@router.post("/scan")
async def trigger_scan():
    result = await scanner.run_scan()
    return result


@router.get("/clusters/summary")
async def cluster_summary():
    snapshots = db.get_latest_snapshots()
    summary = {}
    for cluster_name, symbols in CORRELATION_CLUSTERS.items():
        cluster_snaps = [s for s in snapshots if s.get("symbol") in symbols]
        active = [
            s["symbol"]
            for s in cluster_snaps
            if any(l.get("proximity") for l in s.get("levels", []))
            or s.get("confluence_score", 0) >= 2
        ]
        summary[cluster_name] = {
            "symbols": symbols,
            "active_symbols": active,
            "avg_confluence": round(
                sum(s.get("confluence_score", 0) for s in cluster_snaps) / max(len(cluster_snaps), 1),
                2,
            ),
        }
    return {"clusters": summary}
