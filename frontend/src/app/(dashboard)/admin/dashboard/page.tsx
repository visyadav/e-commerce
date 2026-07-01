"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";

import { dashboardService } from "@/src/services/dashboard/dashboard-service";
import { MetricsGrid } from "@/src/components/dashboard/metrics-grid";
import { SalesCharts } from "@/src/components/dashboard/sales-charts";
import { LowStockBoard } from "@/src/components/dashboard/low-stock-board";
import type {
  DashboardSummaryResponse,
  SalesTrendItemResponse,
  LowStockAlertResponse,
} from "@/src/types";

const DATE_RANGES = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
  { label: "Year to Date", days: -1 }, // special: YTD
] as const;

function getDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  if (days === -1) {
    // Year-to-date
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(end.getDate() - days);
  }
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

export default function DashboardPage() {
  const [selectedRange, setSelectedRange] = React.useState(1); // default: Last 30 Days
  const [trendPeriod, setTrendPeriod] = React.useState("daily");

  const [summary, setSummary] = React.useState<DashboardSummaryResponse | null>(null);
  const [trends, setTrends] = React.useState<SalesTrendItemResponse[]>([]);
  const [lowStock, setLowStock] = React.useState<LowStockAlertResponse[]>([]);

  const [loadingSummary, setLoadingSummary] = React.useState(true);
  const [loadingTrends, setLoadingTrends] = React.useState(true);
  const [loadingStock, setLoadingStock] = React.useState(true);

  // Fetch summary & low-stock when date range changes
  React.useEffect(() => {
    const { startDate, endDate } = getDateRange(DATE_RANGES[selectedRange].days);

    setLoadingSummary(true);
    dashboardService
      .getSummary(startDate, endDate)
      .then((data) => setSummary(data))
      .catch((err) => {
        console.error("Failed to load dashboard summary:", err);
        toast.error("Failed to load dashboard summary");
      })
      .finally(() => setLoadingSummary(false));

    setLoadingStock(true);
    dashboardService
      .getLowStockAlerts()
      .then((data) => setLowStock(data))
      .catch((err) => {
        console.error("Failed to load low stock alerts:", err);
        toast.error("Failed to load low stock alerts");
      })
      .finally(() => setLoadingStock(false));
  }, [selectedRange]);

  // Fetch trends when date range or period changes
  React.useEffect(() => {
    const { startDate, endDate } = getDateRange(DATE_RANGES[selectedRange].days);

    setLoadingTrends(true);
    dashboardService
      .getTrends(trendPeriod, startDate, endDate)
      .then((data) => setTrends(data))
      .catch((err) => {
        console.error("Failed to load sales trends:", err);
        toast.error("Failed to load sales trends");
      })
      .finally(() => setLoadingTrends(false));
  }, [selectedRange, trendPeriod]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Store overview and key performance indicators
          </p>
        </div>

        {/* Date range selector */}
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <div className="flex rounded-lg border bg-muted/30 p-0.5">
            {DATE_RANGES.map((range, i) => (
              <button
                key={i}
                onClick={() => setSelectedRange(i)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedRange === i
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <MetricsGrid data={summary} isLoading={loadingSummary} />

      {/* Charts + Low stock in a responsive grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SalesCharts
            data={trends}
            isLoading={loadingTrends}
            period={trendPeriod}
            onPeriodChange={setTrendPeriod}
          />
        </div>
        <div className="lg:col-span-2">
          <LowStockBoard data={lowStock} isLoading={loadingStock} />
        </div>
      </div>
    </div>
  );
}
