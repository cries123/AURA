import { useEffect, useMemo, useRef } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineStyle,
} from "lightweight-charts";
import type { Bar, LiquidityLevel, ZeroDTEContext } from "../types";
import type { IndicatorToggles } from "../lib/indicatorToggles";
import { buildLevelPairs, isLevelActionable, pairForTimeframe } from "../lib/levelPairs";

interface ChartPanelProps {
  symbol: string;
  timeframe: string;
  bars: Bar[];
  levels: LiquidityLevel[];
  lastPrice?: number;
  indicators: IndicatorToggles;
  dealingRange?: {
    high?: number;
    low?: number;
    equilibrium?: number;
    premium_discount?: string;
  };
  zerodte?: ZeroDTEContext | null;
}

export function ChartPanel({
  symbol,
  timeframe,
  bars,
  levels,
  lastPrice,
  indicators,
  dealingRange,
  zerodte,
}: ChartPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const levelLinesRef = useRef<ReturnType<IChartApi["addLineSeries"]>[]>([]);
  const priceLineRefs = useRef<ReturnType<ISeriesApi<"Candlestick">["createPriceLine"]>[]>([]);

  const activePair = useMemo(() => {
    const pairs = buildLevelPairs(levels, lastPrice);
    return pairForTimeframe(pairs, timeframe);
  }, [levels, lastPrice, timeframe]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0d1117" },
        textColor: "#c9d1d9",
      },
      grid: {
        vertLines: { color: "#21262d" },
        horzLines: { color: "#21262d" },
      },
      width: containerRef.current.clientWidth,
      height: 420,
      timeScale: { borderColor: "#30363d" },
      rightPriceScale: { borderColor: "#30363d" },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#3fb950",
      downColor: "#f85149",
      borderVisible: false,
      wickUpColor: "#3fb950",
      wickDownColor: "#f85149",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      levelLinesRef.current = [];
      priceLineRefs.current = [];
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;

    priceLineRefs.current.forEach((pl) => seriesRef.current?.removePriceLine(pl));
    priceLineRefs.current = [];

    const candleData: CandlestickData[] = bars.map((b) => ({
      time: b.time as CandlestickData["time"],
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));
    seriesRef.current.setData(candleData);

    levelLinesRef.current.forEach((line) => chartRef.current?.removeSeries(line));
    levelLinesRef.current = [];

    const session = zerodte?.session_levels;

    if (indicators.eql_eqh) {
      const bracketLevels: LiquidityLevel[] = [];
      if (activePair?.eql && isLevelActionable(activePair.eql)) bracketLevels.push(activePair.eql);
      if (activePair?.eqh && isLevelActionable(activePair.eqh)) bracketLevels.push(activePair.eqh);

      bracketLevels.forEach((level) => {
        const color = level.level_type === "EQH" ? "#f85149" : "#58a6ff";
        const pl = seriesRef.current!.createPriceLine({
          price: level.price,
          color,
          lineWidth: level.proximity ? 2 : 1,
          lineStyle: level.proximity ? LineStyle.Solid : LineStyle.Dashed,
          axisLabelVisible: true,
          title: `${level.level_type} ${level.price.toFixed(2)}`,
        });
        priceLineRefs.current.push(pl);
      });
    }

    const addHLine = (price: number, color: string, lineStyle: LineStyle, title: string) => {
      const line = chartRef.current!.addLineSeries({
        color,
        lineWidth: 1,
        lineStyle,
        title,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      if (bars.length >= 2) {
        line.setData([
          { time: bars[0].time as CandlestickData["time"], value: price },
          { time: bars[bars.length - 1].time as CandlestickData["time"], value: price },
        ]);
      }
      levelLinesRef.current.push(line);
    };

    if (bars.length >= 2) {
      if (
        indicators.eql_eqh &&
        activePair?.eql &&
        activePair?.eqh &&
        isLevelActionable(activePair.eql) &&
        isLevelActionable(activePair.eqh)
      ) {
        const top = Math.max(activePair.eql.price, activePair.eqh.price);
        const bottom = Math.min(activePair.eql.price, activePair.eqh.price);
        addHLine(top, "rgba(88, 166, 255, 0.35)", LineStyle.Solid, "Bracket Top");
        addHLine(bottom, "rgba(88, 166, 255, 0.35)", LineStyle.Solid, "Bracket Bot");
      }

      if (indicators.bracket_mid && activePair?.mid != null) {
        addHLine(activePair.mid, "#8b949e", LineStyle.Dotted, "Bracket Mid");
      }
    }

    if (indicators.equilibrium && dealingRange?.equilibrium) {
      addHLine(dealingRange.equilibrium, "#8b949e", LineStyle.Dotted, "Equilibrium");
    }

    if (indicators.vwap && zerodte?.vwap?.vwap) {
      addHLine(zerodte.vwap.vwap, "#d29922", LineStyle.Solid, "VWAP");
    }

    if (indicators.or15) {
      if (session?.or_15m_high) addHLine(session.or_15m_high, "#a371f7", LineStyle.Dashed, "OR15 H");
      if (session?.or_15m_low) addHLine(session.or_15m_low, "#a371f7", LineStyle.Dashed, "OR15 L");
    }

    if (indicators.or5) {
      if (session?.or_5m_high) addHLine(session.or_5m_high, "#bc8cff", LineStyle.Dotted, "OR5 H");
      if (session?.or_5m_low) addHLine(session.or_5m_low, "#bc8cff", LineStyle.Dotted, "OR5 L");
    }

    if (indicators.premarket) {
      if (session?.premarket_high) addHLine(session.premarket_high, "#79c0ff", LineStyle.Dashed, "PMH");
      if (session?.premarket_low) addHLine(session.premarket_low, "#79c0ff", LineStyle.Dashed, "PML");
    }

    if (indicators.prior_day) {
      if (session?.prior_day_high) addHLine(session.prior_day_high, "#ffa657", LineStyle.Dashed, "PDH");
      if (session?.prior_day_low) addHLine(session.prior_day_low, "#ffa657", LineStyle.Dashed, "PDL");
      if (session?.prior_day_close) addHLine(session.prior_day_close, "#ffa657", LineStyle.Dotted, "PDC");
    }

    if (indicators.max_pain && zerodte?.chain?.max_pain) {
      addHLine(zerodte.chain.max_pain, "#f0883e", LineStyle.Dotted, "Max Pain");
    }

    chartRef.current.timeScale().fitContent();
  }, [bars, activePair, dealingRange, zerodte, indicators]);

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <h2>
          {symbol} <span className="muted">{timeframe.toUpperCase()}</span>
        </h2>
        {activePair && (activePair.eql || activePair.eqh) && (
          <div className="bracket-chip">
            {activePair.eql && (
              <span className="eql">EQL {activePair.eql.price.toFixed(2)}</span>
            )}
            <span className="bracket-sep">↔</span>
            {activePair.eqh && (
              <span className="eqh">EQH {activePair.eqh.price.toFixed(2)}</span>
            )}
            {activePair.range != null && (
              <span className="muted">(${activePair.range.toFixed(2)} range)</span>
            )}
          </div>
        )}
      </div>
      <div ref={containerRef} className="chart-container" />
    </div>
  );
}
