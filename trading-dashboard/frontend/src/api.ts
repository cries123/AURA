import type { Alert, Bar, BreadthData, DivergenceData, EventsData, JournalEntry, Snapshot } from "./types";

const API = "/api";

export async function fetchSnapshots(): Promise<{
  snapshots: Snapshot[];
  divergence?: DivergenceData;
  events?: EventsData;
  breadth?: BreadthData;
}> {
  const res = await fetch(`${API}/snapshots`);
  return res.json();
}

export async function fetchAlerts(minScore = 0, tier?: string): Promise<Alert[]> {
  const q = new URLSearchParams({ min_score: String(minScore) });
  if (tier) q.set("tier", tier);
  const res = await fetch(`${API}/alerts?${q}`);
  const data = await res.json();
  return data.alerts ?? [];
}

export async function fetchJournal(): Promise<JournalEntry[]> {
  const res = await fetch(`${API}/journal`);
  const data = await res.json();
  return data.entries ?? [];
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
