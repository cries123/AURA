from __future__ import annotations

import asyncio
from dataclasses import asdict
from datetime import datetime

from app.analysis.candle_patterns import detect_candle_patterns
from app.analysis.divergence import compute_index_divergence
from app.analysis.events import event_gate_allows_alert, get_event_context
from app.analysis.options_context import get_options_context
from app.analysis.patterns import (
    LiquidityLevel,
    compute_dealing_range,
    detect_acceptance,
    detect_liquidity_levels,
    detect_proximity,
    detect_sweep_reclaim,
    determine_market_structure,
    find_fair_value_gaps,
)
from app.analysis.scoring import aggregate_confluence_score, score_level
from app.analysis.sessions import session_label
from app.analysis.zerodte_pack import build_zerodte_context, classify_alert_tier
from app.config import settings
from app.market.demo_data import build_demo_snapshots
from app.market.market_data import active_data_source, fetch_last_price, fetch_ohlcv, fetch_quote_meta, is_live_available
from app.db import database as db
from app.notifications import send_notifications
from app.watchlist import CORRELATION_CLUSTERS, TIMEFRAMES, WATCHLIST, ZERODTE_SYMBOLS


class ScannerService:
    async def run_scan(self) -> dict:
        results = []
        pending_notifications: list[tuple[int, str]] = []
        live_count = 0

        if not is_live_available():
            results = self._seed_demo_snapshots()
            demo_mode = True
        else:
            demo_mode = False
            for symbol in WATCHLIST:
                try:
                    snapshot, alerts = await asyncio.to_thread(self._scan_symbol, symbol)
                    if snapshot.get("last_price"):
                        live_count += 1
                    results.append(snapshot)
                    pending_notifications.extend(alerts)
                except Exception as exc:
                    results.append({"symbol": symbol, "error": str(exc)})

        divergence = compute_index_divergence(results)
        events = get_event_context()

        for alert_id, message in pending_notifications:
            sent = await send_notifications(message)
            if sent:
                db.mark_alert_notified(alert_id)

        return {
            "scanned": len(results),
            "results": results,
            "demo_mode": demo_mode,
            "data_source": "demo" if demo_mode else active_data_source(),
            "divergence": divergence,
            "events": events,
            "at": datetime.utcnow().isoformat(),
        }

    def _seed_demo_snapshots(self) -> list[dict]:
        demos = build_demo_snapshots()
        for snapshot in demos:
            db.save_snapshot(snapshot["symbol"], snapshot)
            for level in snapshot.get("levels", []):
                db.upsert_level(level)
        return demos

    def _scan_symbol(self, symbol: str) -> tuple[dict, list[tuple[int, str]]]:
        quote = fetch_quote_meta(symbol)
        last_price = quote.get("last") or fetch_last_price(symbol)

        all_levels: list[LiquidityLevel] = []
        structures: dict[str, dict] = {}
        bars_by_tf: dict = {}
        pending_alerts: list[tuple[int, str]] = []

        for tf in TIMEFRAMES:
            df = fetch_ohlcv(symbol, tf)
            bars_by_tf[tf] = df
            if df.empty:
                continue

            levels = detect_liquidity_levels(
                symbol=symbol,
                timeframe=tf,
                df=df,
                tolerance_pct=settings.equal_tolerance_pct,
                min_touches=settings.min_touches,
                lookback=settings.swing_lookback,
            )
            all_levels.extend(levels)

            ms = determine_market_structure(df, lookback=settings.swing_lookback)
            structures[tf] = {
                "structure": ms.structure,
                "last_swing_high": ms.last_swing_high,
                "last_swing_low": ms.last_swing_low,
            }

        bars_1m = bars_by_tf.get("1m")
        bars_5m = bars_by_tf.get("5m")
        open_price = None
        if bars_5m is not None and not bars_5m.empty:
            open_price = float(bars_5m["open"].iloc[0])
        elif bars_1m is not None and not bars_1m.empty:
            open_price = float(bars_1m["open"].iloc[0])

        zerodte = None
        if symbol in ZERODTE_SYMBOLS and last_price:
            zerodte = build_zerodte_context(
                symbol, last_price, bars_1m if bars_1m is not None else bars_by_tf.get("15m"),
                bars_5m if bars_5m is not None else bars_by_tf.get("15m"),
                [], open_price,
            )

        scored_levels = []
        alert_tf = settings.zerodte_alert_timeframe if symbol in ZERODTE_SYMBOLS else settings.primary_alert_timeframe

        for level in all_levels:
            df = bars_by_tf.get(level.timeframe)
            if df is None or df.empty or last_price is None:
                continue

            ms_obj = determine_market_structure(df, lookback=settings.swing_lookback)
            sweep = detect_sweep_reclaim(
                df, level.price, level.level_type, settings.equal_tolerance_pct
            )
            prox = detect_proximity(last_price, level.price, settings.proximity_alert_pct)
            accept = detect_acceptance(df, level.price, level.level_type)

            extra_factors: list[str] = []
            bonus = 0
            patterns = detect_candle_patterns(df, level.price, level.level_type)
            if patterns:
                bonus += 1
                extra_factors.append(patterns[0]["pattern"])

            if zerodte and level.timeframe in ("5m", "15m"):
                session_hits = zerodte.get("session_level_hits") or []
                if session_hits:
                    bonus += 2
                    extra_factors.append("OR/session align")
                if zerodte.get("vwap", {}).get("position") == "above" and level.level_type == "EQL":
                    bonus += 1
                    extra_factors.append("above VWAP at EQL")

            score, factors = score_level(
                level=level,
                all_levels=all_levels,
                structure=ms_obj,
                has_sweep_reclaim=bool(sweep),
                is_proximity=prox,
                has_acceptance=accept,
                zerodte_bonus=bonus,
                extra_factors=extra_factors,
            )

            velocity = {}
            if bars_5m is not None and not bars_5m.empty:
                from app.analysis.velocity import approach_velocity, time_at_level
                velocity = {
                    **approach_velocity(bars_5m, level.price),
                    **time_at_level(bars_5m, level.price),
                }

            level_dict = {
                **asdict(level),
                "score": score,
                "score_factors": factors,
                "structure": structures.get(level.timeframe, {}).get("structure"),
                "session_label": session_label(level.session),
                "sweep_reclaim": sweep,
                "proximity": prox,
                "acceptance": accept,
                "candle_patterns": patterns,
                "velocity": velocity,
                "distance_pct": round(abs(last_price - level.price) / level.price * 100, 3)
                if level.price
                else None,
                "updated_at": datetime.utcnow().isoformat(),
            }
            scored_levels.append(level_dict)
            db.upsert_level(level_dict)

            alert = self._maybe_alert(
                symbol, level_dict, last_price, sweep, prox, accept, zerodte, alert_tf
            )
            if alert:
                pending_alerts.append(alert)

        if zerodte and scored_levels:
            zerodte = build_zerodte_context(
                symbol, last_price,
                bars_1m if bars_1m is not None else bars_by_tf.get("15m"),
                bars_5m if bars_5m is not None else bars_by_tf.get("15m"),
                scored_levels, open_price,
            )

        confluence = aggregate_confluence_score(all_levels, alert_tf)

        primary_df = bars_by_tf.get(alert_tf)
        if primary_df is None or primary_df.empty:
            primary_df = bars_by_tf.get("5m")
        dealing_range = (
            compute_dealing_range(primary_df)
            if primary_df is not None and not primary_df.empty
            else {}
        )
        fvgs = (
            find_fair_value_gaps(primary_df)
            if primary_df is not None and not primary_df.empty
            else []
        )

        nearest_level_price = (
            min(scored_levels, key=lambda x: x.get("distance_pct") or 999)["price"]
            if scored_levels
            else (last_price or 0)
        )
        options_ctx = get_options_context(symbol, last_price or 0, nearest_level_price)
        if zerodte and zerodte.get("chain"):
            options_ctx["expected_move"] = zerodte["chain"].get("expected_move")
            options_ctx["expected_move_pct"] = zerodte["chain"].get("expected_move_pct")
            options_ctx["em_consumed_pct"] = (zerodte.get("em_consumed") or {}).get("consumed_pct")

        cluster = next(
            (name for name, symbols in CORRELATION_CLUSTERS.items() if symbol in symbols),
            "other",
        )

        snapshot = {
            "symbol": symbol,
            "quote": quote,
            "last_price": last_price,
            "data_source": quote.get("data_source", active_data_source()),
            "cluster": cluster,
            "confluence_score": confluence,
            "structures": structures,
            "levels": sorted(scored_levels, key=lambda x: x["score"], reverse=True),
            "dealing_range": dealing_range,
            "fvgs": fvgs,
            "options_context": options_ctx,
            "zerodte": zerodte,
            "primary_timeframe": alert_tf,
            "updated_at": datetime.utcnow().isoformat(),
        }
        db.save_snapshot(symbol, snapshot)
        return snapshot, pending_alerts

    def _maybe_alert(
        self,
        symbol: str,
        level: dict,
        last_price: float,
        sweep: dict | None,
        prox: bool,
        accept: bool,
        zerodte: dict | None,
        alert_tf: str,
    ) -> tuple[int, str] | None:
        allowed, gate_reason = event_gate_allows_alert()
        events: list[tuple[str, str]] = []

        if level["timeframe"] == alert_tf:
            if sweep:
                events.append(
                    ("sweep_reclaim", f"Sweep + reclaim at {level['level_type']} {level['price']:.2f}")
                )
            if prox:
                events.append(("proximity", f"Price near {level['level_type']} {level['price']:.2f}"))
            if accept:
                events.append(
                    ("acceptance", f"Acceptance beyond {level['level_type']} {level['price']:.2f}")
                )
            for pat in level.get("candle_patterns") or []:
                events.append((pat["pattern"], f"{pat['pattern']} at {level['level_type']}"))

        for event_type, detail in events:
            if level["score"] < settings.min_setup_score:
                continue

            tier = classify_alert_tier(level["score"], level, symbol, zerodte)

            if not allowed and tier == "A":
                tier = "B"

            cooldown_key = (
                f"{symbol}:{level['timeframe']}:{event_type}:"
                f"{level['level_type']}:{round(level['price'], 2)}"
            )
            if not db.check_cooldown(cooldown_key, settings.alert_cooldown_minutes):
                continue

            options_ctx = get_options_context(symbol, last_price, level["price"])
            if zerodte:
                options_ctx["em_consumed_pct"] = (zerodte.get("em_consumed") or {}).get("consumed_pct")
                options_ctx["max_pain"] = (zerodte.get("chain") or {}).get("max_pain")

            strike = options_ctx.get("nearest_strike")
            dist = options_ctx.get("distance_to_level_pct")
            tier_label = f"Tier {tier}"
            message = (
                f"<b>[{tier_label}] {symbol}</b> {level['timeframe'].upper()} | Score {level['score']}\n"
                f"{detail}\n"
                f"Last: {last_price:.2f} | Dist: {dist}% | Strike: {strike}\n"
                f"Factors: {', '.join(level['score_factors'])}"
            )
            if gate_reason and tier != "A":
                message += f"\n<i>{gate_reason}</i>"

            alert_id = db.insert_alert(
                {
                    "symbol": symbol,
                    "timeframe": level["timeframe"],
                    "event_type": event_type,
                    "level_type": level["level_type"],
                    "level_price": level["price"],
                    "message": message,
                    "score": level["score"],
                    "score_factors": level["score_factors"],
                    "options_context": options_ctx,
                    "tier": tier,
                }
            )

            db.insert_journal(
                {
                    "alert_id": alert_id,
                    "symbol": symbol,
                    "setup": event_type,
                    "level_price": level["price"],
                    "score": level["score"],
                    "tier": tier,
                    "notes": detail,
                }
            )

            db.set_cooldown(cooldown_key)

            if tier == "A":
                return alert_id, message

        return None


scanner = ScannerService()
