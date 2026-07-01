"use client";

import * as React from "react";
import type { SalesTrendItemResponse } from "@/src/types";

interface SalesChartsProps {
  data: SalesTrendItemResponse[];
  isLoading: boolean;
  period: string;
  onPeriodChange: (period: string) => void;
}

const PERIODS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

function formatCompact(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

// ---------- pure-SVG area chart ----------
function AreaChart({
  data,
  width,
  height,
}: {
  data: SalesTrendItemResponse[];
  width: number;
  height: number;
}) {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  if (data.length === 0) return null;

  const padding = { top: 24, right: 16, bottom: 40, left: 56 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const yTicks = 5;
  const yStep = maxRevenue / yTicks;

  const points = data.map((d, i) => ({
    x: padding.left + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2),
    y: padding.top + plotH - (d.revenue / maxRevenue) * plotH,
    data: d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + plotH} L ${points[0].x} ${padding.top + plotH} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto select-none"
      onMouseLeave={() => setHoverIndex(null)}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="[stop-color:var(--color-primary)]" stopOpacity="0.3" />
          <stop offset="100%" className="[stop-color:var(--color-primary)]" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Y-axis grid lines and labels */}
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const yVal = yStep * i;
        const y = padding.top + plotH - (yVal / maxRevenue) * plotH;
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={padding.left + plotW}
              y2={y}
              className="stroke-border"
              strokeWidth="1"
              strokeDasharray={i === 0 ? "0" : "4 4"}
              opacity={0.5}
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {formatCompact(yVal)}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Dots & hit areas */}
      {points.map((p, i) => (
        <g key={i} onMouseEnter={() => setHoverIndex(i)}>
          {/* invisible hit area */}
          <rect
            x={p.x - (plotW / data.length) / 2}
            y={padding.top}
            width={plotW / data.length}
            height={plotH}
            fill="transparent"
          />
          {/* dot */}
          <circle
            cx={p.x}
            cy={p.y}
            r={hoverIndex === i ? 5 : 3}
            className={`transition-all duration-150 ${hoverIndex === i ? "fill-primary stroke-background" : "fill-primary/60"}`}
            strokeWidth={hoverIndex === i ? 2 : 0}
          />
        </g>
      ))}

      {/* x-axis labels */}
      {points.map((p, i) => {
        const showLabel = data.length <= 14 || i % Math.ceil(data.length / 10) === 0;
        if (!showLabel) return null;
        return (
          <text
            key={i}
            x={p.x}
            y={padding.top + plotH + 20}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {p.data.periodLabel.length > 6 ? p.data.periodLabel.slice(5) : p.data.periodLabel}
          </text>
        );
      })}

      {/* Tooltip */}
      {hoverIndex !== null && points[hoverIndex] && (
        <g>
          {/* Vertical guideline */}
          <line
            x1={points[hoverIndex].x}
            y1={padding.top}
            x2={points[hoverIndex].x}
            y2={padding.top + plotH}
            className="stroke-muted-foreground/30"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          {/* Tooltip box */}
          <rect
            x={Math.min(points[hoverIndex].x - 60, width - padding.right - 120)}
            y={Math.max(points[hoverIndex].y - 52, padding.top)}
            width={120}
            height={44}
            rx={8}
            className="fill-popover stroke-border"
            strokeWidth="1"
          />
          <text
            x={Math.min(points[hoverIndex].x - 60, width - padding.right - 120) + 10}
            y={Math.max(points[hoverIndex].y - 52, padding.top) + 18}
            className="fill-foreground text-[11px] font-semibold"
          >
            {formatCurrency(data[hoverIndex].revenue)}
          </text>
          <text
            x={Math.min(points[hoverIndex].x - 60, width - padding.right - 120) + 10}
            y={Math.max(points[hoverIndex].y - 52, padding.top) + 34}
            className="fill-muted-foreground text-[10px]"
          >
            {data[hoverIndex].periodLabel} · {data[hoverIndex].ordersCount} orders
          </text>
        </g>
      )}
    </svg>
  );
}

// ---------- pure-SVG bar chart ----------
function BarChart({
  data,
  width,
  height,
}: {
  data: SalesTrendItemResponse[];
  width: number;
  height: number;
}) {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  if (data.length === 0) return null;

  const padding = { top: 24, right: 16, bottom: 40, left: 44 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const maxOrders = Math.max(...data.map((d) => d.ordersCount), 1);
  const barGap = Math.max(2, plotW / data.length * 0.2);
  const barWidth = Math.max(4, (plotW - barGap * data.length) / data.length);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto select-none"
      onMouseLeave={() => setHoverIndex(null)}
    >
      {/* Y-axis */}
      {Array.from({ length: 5 }).map((_, i) => {
        const yVal = (maxOrders / 4) * i;
        const y = padding.top + plotH - (yVal / maxOrders) * plotH;
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={padding.left + plotW}
              y2={y}
              className="stroke-border"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity={0.5}
            />
            <text x={padding.left - 6} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
              {Math.round(yVal)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.ordersCount / maxOrders) * plotH;
        const x = padding.left + i * (barWidth + barGap) + barGap / 2;
        const y = padding.top + plotH - barH;
        const isHovered = hoverIndex === i;
        return (
          <g key={i} onMouseEnter={() => setHoverIndex(i)}>
            <rect x={x} y={y} width={barWidth} height={barH} rx={3}
              className={`transition-all duration-150 ${isHovered ? "fill-primary" : "fill-primary/50"}`}
            />
            {/* x-axis label */}
            {(data.length <= 14 || i % Math.ceil(data.length / 10) === 0) && (
              <text
                x={x + barWidth / 2}
                y={padding.top + plotH + 20}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {d.periodLabel.length > 6 ? d.periodLabel.slice(5) : d.periodLabel}
              </text>
            )}
          </g>
        );
      })}

      {/* Tooltip */}
      {hoverIndex !== null && data[hoverIndex] && (() => {
        const d = data[hoverIndex];
        const barH = (d.ordersCount / maxOrders) * plotH;
        const x = padding.left + hoverIndex * (barWidth + barGap) + barGap / 2;
        const tipX = Math.min(x, width - padding.right - 100);
        const tipY = Math.max(padding.top + plotH - barH - 52, padding.top);
        return (
          <g>
            <rect x={tipX} y={tipY} width={100} height={40} rx={8}
              className="fill-popover stroke-border" strokeWidth="1"
            />
            <text x={tipX + 8} y={tipY + 17} className="fill-foreground text-[11px] font-semibold">
              {d.ordersCount} orders
            </text>
            <text x={tipX + 8} y={tipY + 32} className="fill-muted-foreground text-[10px]">
              {d.periodLabel}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// ---------- Main component ----------
export function SalesCharts({ data, isLoading, period, onPeriodChange }: SalesChartsProps) {
  const [activeTab, setActiveTab] = React.useState<"revenue" | "orders">("revenue");

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 animate-pulse rounded bg-muted/65" />
          <div className="h-8 w-48 animate-pulse rounded bg-muted/65" />
        </div>
        <div className="h-[320px] w-full animate-pulse rounded-lg bg-muted/40" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Sales Trends</h3>
          <p className="text-sm text-muted-foreground">Track your revenue and order volume over time</p>
        </div>
        <div className="flex gap-2">
          {/* Chart type toggle */}
          <div className="flex rounded-lg border bg-muted/30 p-0.5">
            <button
              onClick={() => setActiveTab("revenue")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === "revenue"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Orders
            </button>
          </div>
          {/* Period selector */}
          <div className="flex rounded-lg border bg-muted/30 p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => onPeriodChange(p.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  period === p.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
          No trend data available for the selected period.
        </div>
      ) : activeTab === "revenue" ? (
        <AreaChart data={data} width={720} height={340} />
      ) : (
        <BarChart data={data} width={720} height={340} />
      )}
    </div>
  );
}
