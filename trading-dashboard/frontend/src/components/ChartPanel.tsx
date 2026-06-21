import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineStyle,
} from "lightweight-charts";
import type { Bar, LiquidityLevel, ZeroDTEContext } from "../types";

interface ChartPanelProps {
  symbol: string;
  timeframe: string;
  bars: Bar[];
  levels: LiquidityLevel[];
  dealingRange?: {
    high?: number;
    low?: number;
    equilibrium?: number;
    premium_discount?: string;
  };
  zerodte?: ZeroDTEContext | null;
}

export function ChartPanel({ symbol, timeframe, bars, levels, dealingRange, zerodte }: ChartPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const levelLinesRef = useRef<ReturnType<IChartApi["addLineSeries"]>[]>([]);

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
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;

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

    const tfLevels = levels.filter((l) => l.timeframe === timeframe);

    tfLevels.forEach((level) => {
      const color = level.level_type === "EQH" ? "#f85149" : "#58a6ff";
      const line = chartRef.current!.addLineSeries({
        color,
        lineWidth: level.proximity ? 2 : 1,
        lineStyle: level.proximity ? LineStyle.Solid : LineStyle.Dashed,
        title: `${level.level_type} ${level.price.toFixed(2)} (${level.touches})`,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      if (bars.length >= 2) {
        line.setData([
          { time: bars[0].time as CandlestickData["time"], value: level.price },
          { time: bars[bars.length - 1].time as CandlestickData["time"], value: level.price },
        ]);
      }
      levelLinesRef.current.push(line);
    });

    if (dealingRange?.equilibrium) {
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
        color, lineWidth: 1, lineStyle, title, priceLineVisible: false, lastValueVisible: false,
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
    if (zerodte?.session_levels?.or_15m_high) addHLine(zerodte.session_levels.or_15m_high, "#a371f7", LineStyle.Dashed, "OR15 H");
    if (zerodte?.session_levels?.or_15m_low) addHLine(zerodte.session_levels.or_15m_low, "#a371f7", LineStyle.Dashed, "OR15 L");
    if (zerodte?.chain?.max_pain) addHLine(zerodte.chain.max_pain, "#f0883e", LineStyle.Dotted, "Max Pain");

    chartRef.current.timeScale().fitContent();
  }, [bars, levels, timeframe, dealingRange, zerodte]);

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <h2>
          {symbol} <span className="muted">{timeframe.toUpperCase()}</span>
        </h2>
        <div className="chart-legend">
          <span className="legend-eqh">EQH</span>
          <span className="legend-eql">EQL</span>
          <span className="legend-eq">Equilibrium</span>
          <span className="legend-vwap">VWAP</span>
          <span className="legend-or">OR15</span>
        </div>
      </div>
      <div ref={containerRef} className="chart-container" />
    </div>
  );
}
