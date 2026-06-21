import type { Alert, Bar, Snapshot } from "./types";

const API = "/api";

export async function fetchSnapshots(): Promise<Snapshot[]> {
  const res = await fetch(`${API}/snapshots`);
  const data = await res.json();
  return data.snapshots ?? [];
}

export async function fetchAlerts(minScore = 0): Promise<Alert[]> {
  const res = await fetch(`${API}/alerts?min_score=${minScore}`);
  const data = await res.json();
  return data.alerts ?? [];
}

export async function fetchBars(symbol: string, timeframe: string): Promise<Bar[]> {
  const res = await fetch(`${API}/bars/${symbol}?timeframe=${timeframe}`);
  const data = await res.json();
  return data.bars ?? [];
}

export async function triggerScan(): Promise<void> {
  await fetch(`${API}/scan`, { method: "POST" });
}

export async function fetchClusterSummary(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}/clusters/summary`);
  const data = await res.json();
  return data.clusters ?? {};
}
