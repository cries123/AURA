import type { ZeroDTEContext } from "../types";

interface TradeIdeaPanelProps {
  zerodte: ZeroDTEContext | null | undefined;
}

export function TradeIdeaPanel({ zerodte }: TradeIdeaPanelProps) {
  const idea = zerodte?.trade_idea;
  const bt = zerodte?.backtest;

  return (
    <div className="panel trade-panel">
      <h3>Trade Idea & Backtest</h3>
      {!idea ? (
        <p className="muted">No A-grade setup — waiting for sweep/reclaim at EQL/EQH.</p>
      ) : (
        <div className="trade-idea">
          <p className="trade-structure">{idea.structure.replace(/_/g, " ")}</p>
          <p>{idea.description}</p>
          <div className="trade-legs">
            <span>Short {idea.short_strike}</span>
            <span>Long {idea.long_strike}</span>
            <span>Max loss ~${idea.max_loss_estimate}</span>
            <span>B/E {idea.breakeven_estimate?.toFixed(2)}</span>
          </div>
          <p className="muted">{idea.filters?.join(" · ")}</p>
        </div>
      )}
      {bt && bt.trades > 0 && (
        <div className="backtest-box">
          <h4>Backtest: {bt.rule}</h4>
          <p>
            {bt.trades} trades · Win {bt.win_rate}% · Avg move {bt.avg_move_15b}
          </p>
        </div>
      )}
    </div>
  );
}
