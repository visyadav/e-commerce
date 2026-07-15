"use client";

import { useEffect, useState } from "react";
import { 
  InventoryStatusDto, 
  InventoryRecordDto 
} from "@/src/types/inventory";
import { PaginationMeta } from "@/src/types/api";
import { inventoryService } from "@/src/services/inventory/inventory-service";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { Plus, History, Settings2, AlertTriangle, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryStatusDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  
  // Filters
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Restock Dialog State
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState<InventoryStatusDto | null>(null);
  const [restockQty, setRestockQty] = useState<number | "">("");
  const [restockReason, setRestockReason] = useState("");
  const [restocking, setRestocking] = useState(false);

  // Adjust Dialog State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<InventoryStatusDto | null>(null);
  const [adjustQtyChange, setAdjustQtyChange] = useState<number | "">("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  // History Dialog State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<InventoryStatusDto | null>(null);
  const [historyRecords, setHistoryRecords] = useState<InventoryRecordDto[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getStockLevels(
        debouncedSearch || undefined,
        onlyLowStock || undefined,
        page,
        pageSize
      );
      setInventory(res.data || []);
      setPagination(res.pagination);
    } catch (error) {
      toast.error("Failed to fetch inventory levels");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, pageSize, debouncedSearch, onlyLowStock]);

  const handleOpenRestock = (item: InventoryStatusDto) => {
    setRestockProduct(item);
    setRestockQty("");
    setRestockReason("");
    setIsRestockOpen(true);
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct || !restockQty || typeof restockQty !== "number") return;

    try {
      setRestocking(true);
      await inventoryService.restock({
        productId: restockProduct.productId,
        quantity: restockQty,
        reason: restockReason || undefined
      });
      toast.success("Stock added successfully");
      setIsRestockOpen(false);
      fetchInventory();
    } catch (error) {
      toast.error("Failed to add stock");
    } finally {
      setRestocking(false);
    }
  };

  const handleOpenAdjust = (item: InventoryStatusDto) => {
    setAdjustProduct(item);
    setAdjustQtyChange("");
    setAdjustReason("");
    setIsAdjustOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProduct || typeof adjustQtyChange !== "number" || !adjustReason.trim()) {
      toast.error("Quantity change and reason are required");
      return;
    }

    try {
      setAdjusting(true);
      await inventoryService.adjustStock({
        productId: adjustProduct.productId,
        quantityChange: adjustQtyChange,
        reason: adjustReason
      });
      toast.success("Stock adjusted successfully");
      setIsAdjustOpen(false);
      fetchInventory();
    } catch (error) {
      toast.error("Failed to adjust stock");
    } finally {
      setAdjusting(false);
    }
  };

  const handleOpenHistory = async (item: InventoryStatusDto) => {
    setHistoryProduct(item);
    setIsHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const records = await inventoryService.getProductHistory(item.productId);
      setHistoryRecords(records);
    } catch (error) {
      toast.error("Failed to fetch product history");
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">Manage your stock levels across products.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96">
          <Input 
            placeholder="Search by product name or SKU..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to page 1 on search
            }}
          />
        </div>
        <label className="flex items-center space-x-2 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={onlyLowStock}
            onChange={(e) => {
              setOnlyLowStock(e.target.checked);
              setPage(1);
            }}
          />
          <span className="text-sm font-medium">Show only low stock</span>
        </label>
      </div>

      <div className="rounded-md border bg-card">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Product Name</th>
              <th className="px-6 py-3 font-medium">SKU</th>
              <th className="px-6 py-3 font-medium">Stock</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading inventory...
                  </div>
                </td>
              </tr>
            ) : inventory.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No inventory records found.
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.productId} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{item.productName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.sku || "-"}</td>
                  <td className="px-6 py-4 font-medium">
                    <span className={item.isLowStock ? "text-destructive" : ""}>
                      {item.stockQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.isLowStock ? (
                      <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Low Stock (≤ {item.lowStockThreshold})
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenRestock(item)}>
                        <Plus className="mr-1 h-3 w-3" /> Restock
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenAdjust(item)}>
                        <Settings2 className="mr-1 h-3 w-3" /> Adjust
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenHistory(item)} title="View History">
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{inventory.length}</span> of <span className="font-medium">{pagination.totalCount}</span> results
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevious}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <div className="flex items-center justify-center px-4 text-sm font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Restock Dialog */}
      <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restock Product</DialogTitle>
            <DialogDescription>
              Add new stock for {restockProduct?.productName}. This will increase the current inventory level.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRestockSubmit} className="space-y-4 py-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Quantity to Add</label>
              <Input
                type="number"
                min="1"
                required
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value ? parseInt(e.target.value, 10) : "")}
                placeholder="e.g. 50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Reason (Optional)</label>
              <Input
                value={restockReason}
                onChange={(e) => setRestockReason(e.target.value)}
                placeholder="e.g. New supplier shipment"
              />
            </div>
            <div className="flex justify-end pt-4 space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsRestockOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={restocking}>
                {restocking ? "Saving..." : "Confirm Restock"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
            <DialogDescription>
              Manually adjust inventory for {adjustProduct?.productName}. Use negative numbers for shrinkage or returns to vendor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustSubmit} className="space-y-4 py-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Quantity Change (+/-)</label>
              <Input
                type="number"
                required
                value={adjustQtyChange}
                onChange={(e) => setAdjustQtyChange(e.target.value ? parseInt(e.target.value, 10) : "")}
                placeholder="e.g. -5 or 10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Reason (Required)</label>
              <Input
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Damaged goods, stock count correction"
              />
            </div>
            <div className="flex justify-end pt-4 space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={adjusting}>
                {adjusting ? "Saving..." : "Confirm Adjustment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inventory History</DialogTitle>
            <DialogDescription>
              Historical stock changes for {historyProduct?.productName}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {historyLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : historyRecords.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No history records found.</p>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 font-medium">Change</th>
                      <th className="px-4 py-2 font-medium">Reason</th>
                      <th className="px-4 py-2 font-medium">Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRecords.map((record) => (
                      <tr key={record.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-2 whitespace-nowrap">
                          {format(new Date(record.createdAt), "MMM d, yyyy HH:mm")}
                        </td>
                        <td className="px-4 py-2 font-medium">
                          <span className={record.quantityChange > 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}>
                            {record.quantityChange > 0 ? `+${record.quantityChange}` : record.quantityChange}
                          </span>
                        </td>
                        <td className="px-4 py-2">{record.reason || "-"}</td>
                        <td className="px-4 py-2 text-muted-foreground text-xs">{record.referenceNumber || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}