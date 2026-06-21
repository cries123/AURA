import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineStyle,
} from "lightweight-charts";
import type { Bar, LiquidityLevel } from "../types";

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
}

export function ChartPanel({ symbol, timeframe, bars, levels, dealingRange }: ChartPanelProps) {
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

    chartRef.current.timeScale().fitContent();
  }, [bars, levels, timeframe, dealingRange]);

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
        </div>
      </div>
      <div ref={containerRef} className="chart-container" />
    </div>
  );
}
