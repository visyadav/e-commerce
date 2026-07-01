"use client";

import * as React from "react";
import { AlertTriangle, Package } from "lucide-react";
import type { LowStockAlertResponse } from "@/src/types";

interface LowStockBoardProps {
  data: LowStockAlertResponse[];
  isLoading: boolean;
}

function StockBar({ current, threshold }: { current: number; threshold: number }) {
  const ratio = Math.min(current / Math.max(threshold, 1), 1);
  const color =
    ratio <= 0.25
      ? "bg-rose-500"
      : ratio <= 0.5
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="h-2 flex-1 rounded-full bg-muted/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground whitespace-nowrap">
        {current}/{threshold}
      </span>
    </div>
  );
}

function SeverityBadge({ current, threshold }: { current: number; threshold: number }) {
  const ratio = current / Math.max(threshold, 1);
  if (ratio <= 0.25) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
        <AlertTriangle className="h-3 w-3" />
        Critical
      </span>
    );
  }
  if (ratio <= 0.5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
        Low
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
      OK
    </span>
  );
}

export function LowStockBoard({ data, isLoading }: LowStockBoardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="h-6 w-40 animate-pulse rounded bg-muted/65 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded bg-muted/40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            Low Stock Alerts
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">Products nearing reorder levels</p>
        </div>
        {data.length > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
            {data.length} alert{data.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-foreground">All stocks healthy</p>
          <p className="text-xs text-muted-foreground mt-1">No products are below their reorder threshold.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[140px]">Stock Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((item) => (
                <tr key={item.productId} className="group transition-colors hover:bg-muted/30">
                  <td className="py-3 pr-4">
                    <span className="text-sm font-medium text-foreground">{item.productName}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground font-mono">
                      {item.productSku}
                    </code>
                  </td>
                  <td className="py-3 pr-4">
                    <SeverityBadge current={item.stockQuantity} threshold={item.lowStockThreshold} />
                  </td>
                  <td className="py-3">
                    <StockBar current={item.stockQuantity} threshold={item.lowStockThreshold} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
