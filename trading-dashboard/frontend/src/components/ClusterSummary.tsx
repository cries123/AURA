interface ClusterSummaryProps {
  clusters: Record<string, { active_symbols?: string[]; avg_confluence?: number }>;
}

export function ClusterSummary({ clusters }: ClusterSummaryProps) {
  const entries = Object.entries(clusters);
  if (!entries.length) return null;

  return (
    <div className="cluster-bar">
      {entries.map(([name, data]) => (
        <div key={name} className="cluster-chip">
          <span className="cluster-name">{name}</span>
          <span className="cluster-active">
            {data.active_symbols?.length ?? 0} active
          </span>
          <span className="muted">avg conf {data.avg_confluence ?? 0}</span>
        </div>
      ))}
    </div>
  );
}
