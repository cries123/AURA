import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAlerts,
  fetchBars,
  fetchClusterSummary,
  fetchSnapshots,
  triggerScan,
} from "./api";
import type { Alert, Bar, LiquidityLevel, Snapshot } from "./types";
import { Watchlist } from "./components/Watchlist";
import { ChartPanel } from "./components/ChartPanel";
import { AlertFeed } from "./components/AlertFeed";
import { OptionsPanel } from "./components/OptionsPanel";
import { LevelTable } from "./components/LevelTable";
import { ClusterSummary } from "./components/ClusterSummary";

const TIMEFRAMES = ["15m", "1h", "4h", "1d"];

export default function App() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [clusters, setClusters] = useState<Record<string, { active_symbols?: string[]; avg_confluence?: number }>>({});
  const [selectedSymbol, setSelectedSymbol] = useState("SPY");
  const [timeframe, setTimeframe] = useState("1h");
  const [bars, setBars] = useState<Bar[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LiquidityLevel | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>("");

  const selectedSnapshot = useMemo(
    () => snapshots.find((s) => s.symbol === selectedSymbol) ?? null,
    [snapshots, selectedSymbol]
  );

  const loadData = useCallback(async () => {
    const [snaps, alertList, clusterData] = await Promise.all([
      fetchSnapshots(),
      fetchAlerts(0),
      fetchClusterSummary(),
    ]);
    setSnapshots(snaps);
    setAlerts(alertList);
    setClusters(clusterData as Record<string, { active_symbols?: string[]; avg_confluence?: number }>);
    setLastRefresh(new Date().toLocaleTimeString());
    if (snaps.length && !snaps.find((s) => s.symbol === selectedSymbol)) {
      setSelectedSymbol(snaps[0].symbol);
    }
  }, [selectedSymbol]);

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

  const handleScan = async () => {
    setScanning(true);
    try {
      await triggerScan();
      await loadData();
      const newBars = await fetchBars(selectedSymbol, timeframe);
      setBars(newBars);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Liquidity Dashboard</h1>
          <p className="subtitle">EQL / EQH scanner · multi-TF confluence · options context</p>
          {selectedSnapshot?.options_context?.note?.includes("Demo") && (
            <p className="demo-banner">Demo mode — add live data API for real market scans</p>
          )}
        </div>
        <div className="topbar-actions">
          <span className="muted">Updated {lastRefresh || "—"}</span>
          <button className="btn primary" onClick={handleScan} disabled={scanning}>
            {scanning ? "Scanning…" : "Run Scan"}
          </button>
        </div>
      </header>

      <ClusterSummary clusters={clusters} />

      <div className="layout-main">
        <aside className="sidebar">
          <Watchlist
            snapshots={snapshots}
            selected={selectedSymbol}
            onSelect={setSelectedSymbol}
          />
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
          <ChartPanel
            symbol={selectedSymbol}
            timeframe={timeframe}
            bars={bars}
            levels={selectedSnapshot?.levels ?? []}
            dealingRange={selectedSnapshot?.dealing_range}
          />
          <LevelTable
            snapshot={selectedSnapshot}
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
          />
        </main>

        <aside className="rightbar">
          <OptionsPanel snapshot={selectedSnapshot} selectedLevel={selectedLevel} />
        </aside>
      </div>

      <section className="bottom-section">
        <AlertFeed alerts={alerts} />
      </section>
    </div>
  );
}
