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
import { buildLevelPairs, pairForTimeframe } from "../lib/levelPairs";

interface ChartPanelProps {
  symbol: string;
  timeframe: string;
  bars: Bar[];
  levels: LiquidityLevel[];
  lastPrice?: number;
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

    const bracketLevels: LiquidityLevel[] = [];
    if (activePair?.eql) bracketLevels.push(activePair.eql);
    if (activePair?.eqh) bracketLevels.push(activePair.eqh);

    // Draw EQL and EQH as adjacent price lines on the same scale (labels stack together)
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

    // Shaded bracket between EQL and EQH
    if (activePair?.eql && activePair?.eqh && bars.length >= 2) {
      const top = Math.max(activePair.eql.price, activePair.eqh.price);
      const bottom = Math.min(activePair.eql.price, activePair.eqh.price);
      const topLine = chartRef.current!.addLineSeries({
        color: "rgba(88, 166, 255, 0.25)",
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      const bottomLine = chartRef.current!.addLineSeries({
        color: "rgba(88, 166, 255, 0.25)",
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      const t0 = bars[0].time as CandlestickData["time"];
      const t1 = bars[bars.length - 1].time as CandlestickData["time"];
      topLine.setData([
        { time: t0, value: top },
        { time: t1, value: top },
      ]);
      bottomLine.setData([
        { time: t0, value: bottom },
        { time: t1, value: bottom },
      ]);
      levelLinesRef.current.push(topLine, bottomLine);

      if (activePair.mid != null) {
        const midLine = chartRef.current!.addLineSeries({
          color: "#8b949e",
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          title: "Bracket Mid",
          priceLineVisible: false,
          lastValueVisible: false,
        });
        midLine.setData([
          { time: t0, value: activePair.mid },
          { time: t1, value: activePair.mid },
        ]);
        levelLinesRef.current.push(midLine);
      }
    }

    if (dealingRange?.equilibrium && !activePair?.mid) {
      const eqLine = chartRef.current.addLineSeries({
        color: "#8b949e",
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: "Equilibrium",
        priceLineVisible: false,
        lastValueVisible: false,
      });
      if (bars.length >= 2) {
        eqLine.setData([
          { time: bars[0].time as CandlestickData["time"], value: dealingRange.equilibrium },
          {
            time: bars[bars.length - 1].time as CandlestickData["time"],
            value: dealingRange.equilibrium,
          },
        ]);
      }
      levelLinesRef.current.push(eqLine);
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

    if (zerodte?.vwap?.vwap) addHLine(zerodte.vwap.vwap, "#d29922", LineStyle.Solid, "VWAP");
    if (zerodte?.session_levels?.or_15m_high)
      addHLine(zerodte.session_levels.or_15m_high, "#a371f7", LineStyle.Dashed, "OR15 H");
    if (zerodte?.session_levels?.or_15m_low)
      addHLine(zerodte.session_levels.or_15m_low, "#a371f7", LineStyle.Dashed, "OR15 L");
    if (zerodte?.chain?.max_pain) addHLine(zerodte.chain.max_pain, "#f0883e", LineStyle.Dotted, "Max Pain");

    chartRef.current.timeScale().fitContent();
  }, [bars, activePair, dealingRange, zerodte]);

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
        <div className="chart-legend">
          <span className="legend-eqh">EQH</span>
          <span className="legend-eql">EQL</span>
          <span className="legend-eq">Bracket</span>
        </div>
      </div>
      <div ref={containerRef} className="chart-container" />
    </div>
  );
}
