import * as React from "react";
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Percent, Users } from "lucide-react";
import type { DashboardSummaryResponse } from "@/src/types";

interface MetricsGridProps {
  data: DashboardSummaryResponse | null;
  isLoading: boolean;
}

export function MetricsGrid({ data, isLoading }: MetricsGridProps) {
  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted/65" />
              <div className="h-4 w-4 animate-pulse rounded bg-muted/65" />
            </div>
            <div className="mt-2 space-y-2">
              <div className="h-8 w-32 animate-pulse rounded bg-muted/65" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted/65" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  const metrics = [
    {
      title: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      growth: data.revenueGrowthPercentage,
      icon: DollarSign,
      description: "Gross store revenue",
    },
    {
      title: "Orders Count",
      value: data.totalOrders.toLocaleString(),
      growth: data.ordersGrowthPercentage,
      icon: ShoppingCart,
      description: "Total completed checkouts",
    },
    {
      title: "Average Order Value",
      value: formatCurrency(data.averageOrderValue),
      growth: data.revenueGrowthPercentage - data.ordersGrowthPercentage, // Derived AOV growth proxy
      icon: Percent,
      description: "Revenue earned per checkout",
    },
    {
      title: "New Customers",
      value: data.newCustomersCount.toLocaleString(),
      growth: 0, // No historical comparison in response
      icon: Users,
      description: "Newly registered store users",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, i) => {
        const Icon = metric.icon;
        const isPositive = metric.growth >= 0;
        return (
          <div
            key={i}
            className="group relative rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {metric.title}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary border border-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold tracking-tight">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              {metric.title !== "New Customers" && (
                <div className="flex items-center gap-1 mt-3">
                  <span
                    className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-semibold ${
                      isPositive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="h-3 w-3 shrink-0" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 shrink-0" />
                    )}
                    {Math.abs(metric.growth).toFixed(1)}%
                  </span>
                  <span className="text-xxs text-muted-foreground">vs prev period</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
