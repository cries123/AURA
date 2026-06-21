import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAlerts,
  fetchBars,
  fetchClusterSummary,
  fetchJournal,
  fetchSnapshots,
  triggerScan,
} from "./api";
import type {
  Alert,
  Bar,
  BreadthData,
  DivergenceData,
  EventsData,
  JournalEntry,
  LiquidityLevel,
  Snapshot,
} from "./types";
import { Watchlist } from "./components/Watchlist";
import { ChartPanel } from "./components/ChartPanel";
import { AlertFeed } from "./components/AlertFeed";
import { OptionsPanel } from "./components/OptionsPanel";
import { LevelTable } from "./components/LevelTable";
import { ClusterSummary } from "./components/ClusterSummary";
import { ZeroDTEBar } from "./components/ZeroDTEBar";
import { ChainHeatmap } from "./components/ChainHeatmap";
import { DivergencePanel } from "./components/DivergencePanel";
import { TradeIdeaPanel } from "./components/TradeIdeaPanel";
import { JournalPanel } from "./components/JournalPanel";
import { SessionLevelsPanel } from "./components/SessionLevelsPanel";
import { IndicatorToggleBar } from "./components/IndicatorToggleBar";
import {
  DEFAULT_INDICATORS,
  loadIndicatorToggles,
  saveIndicatorToggles,
  type IndicatorKey,
  type IndicatorToggles,
} from "./lib/indicatorToggles";

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];

export default function App() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [divergence, setDivergence] = useState<DivergenceData>();
  const [events, setEvents] = useState<EventsData>();
  const [breadth, setBreadth] = useState<BreadthData>();
  const [clusters, setClusters] = useState<Record<string, { active_symbols?: string[]; avg_confluence?: number }>>({});
  const [selectedSymbol, setSelectedSymbol] = useState("SPY");
  const [timeframe, setTimeframe] = useState("5m");
  const [bars, setBars] = useState<Bar[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LiquidityLevel | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [dataSource, setDataSource] = useState("");
  const [alertTierFilter, setAlertTierFilter] = useState<string>("");
  const [indicators, setIndicators] = useState<IndicatorToggles>(() => loadIndicatorToggles());

  const selectedSnapshot = useMemo(
    () => snapshots.find((s) => s.symbol === selectedSymbol) ?? null,
    [snapshots, selectedSymbol]
  );

  const loadData = useCallback(async () => {
    const [snapRes, alertList, journalList, clusterData] = await Promise.all([
      fetchSnapshots(),
      fetchAlerts(0, alertTierFilter || undefined),
      fetchJournal(),
      fetchClusterSummary(),
    ]);
    setSnapshots(snapRes.snapshots);
    setDemoMode(!!snapRes.demo_mode);
    setDataSource(snapRes.data_source || "");
    setDivergence(snapRes.divergence);
    setEvents(snapRes.events);
    setBreadth(snapRes.breadth);
    setAlerts(alertList);
    setJournal(journalList);
    setClusters(clusterData as Record<string, { active_symbols?: string[]; avg_confluence?: number }>);
    setLastRefresh(new Date().toLocaleTimeString());
    if (snapRes.snapshots.length && !snapRes.snapshots.find((s) => s.symbol === selectedSymbol)) {
      setSelectedSymbol(snapRes.snapshots[0].symbol);
    }
  }, [selectedSymbol, alertTierFilter]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60_000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    fetchBars(selectedSymbol, timeframe).then(setBars);
  }, [selectedSymbol, timeframe]);

  useEffect(() => {
    setSelectedLevel(null);
  }, [selectedSymbol]);

  const handleIndicatorChange = (key: IndicatorKey, enabled: boolean) => {
    setIndicators((prev) => {
      const next = { ...prev, [key]: enabled };
      saveIndicatorToggles(next);
      return next;
    });
  };

  const handleIndicatorReset = () => {
    const defaults = { ...DEFAULT_INDICATORS };
    setIndicators(defaults);
    saveIndicatorToggles(defaults);
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      await triggerScan();
      await loadData();
      setBars(await fetchBars(selectedSymbol, timeframe));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Liquidity Dashboard</h1>
          <p className="subtitle">0DTE Pro · EQL/EQH · GEX · VWAP · chain heatmap · tiered alerts</p>
          {demoMode ? (
            <p className="demo-banner">Demo mode — market feed unreachable. Check backend network or add POLYGON_API_KEY.</p>
          ) : (
            <p className="live-banner">Live data · {dataSource || "yahoo"}</p>
          )}
        </div>
        <div className="topbar-actions">
          <span className="muted">Updated {lastRefresh || "—"}</span>
          <button className="btn primary" onClick={handleScan} disabled={scanning}>
            {scanning ? "Scanning…" : "Run Scan"}
          </button>
        </div>
      </header>

      <ZeroDTEBar snapshot={selectedSnapshot} events={events} breadth={breadth} />
      <ClusterSummary clusters={clusters} />
      <DivergencePanel data={divergence} />

      <div className="layout-main">
        <aside className="sidebar">
          <Watchlist snapshots={snapshots} selected={selectedSymbol} onSelect={setSelectedSymbol} />
          <SessionLevelsPanel zerodte={selectedSnapshot?.zerodte} />
        </aside>

        <main className="center">
          <div className="tf-tabs">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                className={`tf-tab ${timeframe === tf ? "active" : ""}`}
                onClick={() => setTimeframe(tf)}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
          <IndicatorToggleBar
            toggles={indicators}
            onChange={handleIndicatorChange}
            onReset={handleIndicatorReset}
          />
          <ChartPanel
            symbol={selectedSymbol}
            timeframe={timeframe}
            bars={bars}
            levels={selectedSnapshot?.levels ?? []}
            lastPrice={selectedSnapshot?.last_price}
            indicators={indicators}
            dealingRange={selectedSnapshot?.dealing_range}
            zerodte={selectedSnapshot?.zerodte}
          />
          <LevelTable
            snapshot={selectedSnapshot}
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
          />
        </main>

        <aside className="rightbar">
          <ChainHeatmap zerodte={selectedSnapshot?.zerodte} />
          <OptionsPanel snapshot={selectedSnapshot} selectedLevel={selectedLevel} />
          <TradeIdeaPanel zerodte={selectedSnapshot?.zerodte} />
        </aside>
      </div>

      <section className="bottom-section bottom-grid">
        <div className="alert-filter">
          <span className="muted">Alert tier:</span>
          {["", "A", "B", "C"].map((t) => (
            <button
              key={t || "all"}
              className={`tf-tab ${alertTierFilter === t ? "active" : ""}`}
              onClick={() => setAlertTierFilter(t)}
            >
              {t || "All"}
            </button>
          ))}
        </div>
        <AlertFeed alerts={alerts} />
        <JournalPanel entries={journal} />
      </section>
    </div>
  );
}
