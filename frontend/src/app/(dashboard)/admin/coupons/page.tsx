"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Tag,
  Layers,
  History,
  UserCheck,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  couponAdminService,
  CouponDto,
  CreateCouponRequest,
  CouponUsageLogDto,
} from "@/src/services/coupon-service";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchingId, setFetchingId] = useState<string | null>(null);

  // Dialog & Editing State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Usage Logs State
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);
  const [usageLogs, setUsageLogs] = useState<CouponUsageLogDto[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedCouponCode, setSelectedCouponCode] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateCouponRequest>({
    code: "",
    description: "",
    discountPercentage: 10,
    maxDiscountAmount: 100,
    minOrderAmount: 200,
    maxUsageCount: 1000,
    maxUsagePerUser: 1,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponAdminService.getAllCoupons();
      setCoupons(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch coupons from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      discountPercentage: 10,
      maxDiscountAmount: 100,
      minOrderAmount: 200,
      maxUsageCount: 1000,
      maxUsagePerUser: 1,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = async (couponId: string) => {
    try {
      setFetchingId(couponId);
      const data = await couponAdminService.getCouponById(couponId);
      if (data) {
        setEditingCoupon(data);
        setFormData({
          code: data.code,
          description: data.description || "",
          discountPercentage: data.discountPercentage,
          maxDiscountAmount: data.maxDiscountAmount || undefined,
          minOrderAmount: data.minOrderAmount,
          maxUsageCount: data.maxUsageCount,
          maxUsagePerUser: data.maxUsagePerUser || 1,
          startDate: data.startDate.split("T")[0],
          endDate: data.endDate.split("T")[0],
          isActive: data.isActive,
          productId: data.productId,
          categoryId: data.categoryId,
        });
        setIsDialogOpen(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch coupon details");
    } finally {
      setFetchingId(null);
    }
  };

  const handleOpenUsageLogs = async (couponId?: string, code?: string) => {
    try {
      setLogsLoading(true);
      setSelectedCouponCode(code || "All Coupons");
      setIsLogsDialogOpen(true);
      const data = couponId
        ? await couponAdminService.getCouponUsageLogs(couponId)
        : await couponAdminService.getAllUsageLogs();
      setUsageLogs(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load coupon usage logs");
    } finally {
      setLogsLoading(false);
    }
  };

  const handleToggleActive = async (coupon: CouponDto) => {
    try {
      await couponAdminService.toggleStatus(coupon.id);
      toast.success(
        `Coupon "${coupon.code}" is now ${!coupon.isActive ? "Active" : "Disabled"}`
      );
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle coupon status");
    }
  };

  const handleDelete = async (coupon: CouponDto) => {
    if (!confirm(`Are you sure you want to delete coupon '${coupon.code}'?`)) return;

    try {
      await couponAdminService.deleteCoupon(coupon.id);
      toast.success(`Deleted coupon "${coupon.code}"`);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete coupon");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateCouponRequest = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingCoupon) {
        await couponAdminService.updateCoupon(editingCoupon.id, payload);
        toast.success(`Updated coupon "${payload.code}"`);
      } else {
        await couponAdminService.createCoupon(payload);
        toast.success(`Created coupon "${payload.code}"`);
      }
      setIsDialogOpen(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed to save coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coupons & Offers</h2>
          <p className="text-muted-foreground">
            Manage promotional codes, per-user usage limits, and track customer usage logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleOpenUsageLogs()}>
            <History className="mr-2 h-4 w-4" /> Usage Tracking Logs
          </Button>
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" /> Create Coupon
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96 relative">
          <Input
            placeholder="Search coupon code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-md border bg-card">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Coupon Code</th>
              <th className="px-6 py-3 font-medium">Discount</th>
              <th className="px-6 py-3 font-medium">Min Order</th>
              <th className="px-6 py-3 font-medium">Per-User Limit</th>
              <th className="px-6 py-3 font-medium">Global Usage</th>
              <th className="px-6 py-3 font-medium">Validity</th>
              <th className="px-6 py-3 font-medium">Active Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading coupons...
                  </div>
                </td>
              </tr>
            ) : filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  No coupons found.
                </td>
              </tr>
            ) : (
              filteredCoupons.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                  {/* Code */}
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded text-xs">
                        {item.code}
                      </span>
                    </div>
                    {item.description ? (
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                        {item.description}
                      </p>
                    ) : null}
                  </td>

                  {/* Discount */}
                  <td className="px-6 py-4">
                    <span className="font-bold">{item.discountPercentage}% OFF</span>
                    {item.maxDiscountAmount ? (
                      <p className="text-xs text-muted-foreground">Max ₹{item.maxDiscountAmount}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">No cap</p>
                    )}
                  </td>

                  {/* Min Order */}
                  <td className="px-6 py-4 font-medium">₹{item.minOrderAmount}</td>

                  {/* Per-User Limit */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      <UserCheck className="h-3 w-3" /> {item.maxUsagePerUser} use/user
                    </span>
                  </td>

                  {/* Global Usage */}
                  <td className="px-6 py-4 text-muted-foreground">
                    <span className="font-medium text-foreground">{item.currentUsageCount}</span> / {item.maxUsageCount}
                  </td>

                  {/* Dates */}
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    <div>Start: {new Date(item.startDate).toLocaleDateString()}</div>
                    <div>End: {new Date(item.endDate).toLocaleDateString()}</div>
                  </td>

                  {/* Active Switch */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() => handleToggleActive(item)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.isActive ? (
                          <span className="text-green-600 dark:text-green-400 font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="text-destructive font-medium inline-flex items-center gap-1">
                            <XCircle className="h-3.5 w-3.5" /> Disabled
                          </span>
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenUsageLogs(item.id, item.code)}
                        title="View Usage Logs for this Coupon"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={fetchingId === item.id}
                        onClick={() => handleOpenEdit(item.id)}
                        title="Edit Coupon"
                      >
                        {fetchingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Pencil className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item)}
                        title="Delete Coupon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Usage Tracking Logs Modal */}
      <Dialog open={isLogsDialogOpen} onOpenChange={setIsLogsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <span>Coupon Usage Logs ({selectedCouponCode})</span>
            </DialogTitle>
            <DialogDescription>
              Per-user tracking records showing which customer applied which coupon and discount saved.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 overflow-x-auto max-h-96">
            {logsLoading ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading usage history...
              </div>
            ) : usageLogs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No user usage logs recorded for this coupon yet.
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-2">Coupon</th>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Phone</th>
                    <th className="px-4 py-2">Saved</th>
                    <th className="px-4 py-2">Used At</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {usageLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2 font-mono font-bold text-primary">{log.code}</td>
                      <td className="px-4 py-2 font-medium">{log.userFullName || "Customer"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{log.userPhone || "N/A"}</td>
                      <td className="px-4 py-2 font-bold text-green-600">₹{log.discountAmount}</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {new Date(log.usedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Coupon Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Edit Coupon Code" : "Create New Coupon"}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon
                ? `Update discount rules or per-user limits for ${editingCoupon.code}.`
                : "Configure a new discount code, percentage savings, and customer usage limits."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Coupon Code *</label>
              <Input
                required
                placeholder="e.g. COOK30"
                className="font-mono uppercase font-bold"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="e.g. 30% OFF up to ₹100 on non-discounted grocery items"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Discount (%) *</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Max Discount (₹)</label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={formData.maxDiscountAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Min Order (₹)</label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrderAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Per-User Limit *</label>
                <Input
                  type="number"
                  min="1"
                  required
                  title="Number of times a single customer can use this coupon"
                  value={formData.maxUsagePerUser}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUsagePerUser: parseInt(e.target.value, 10) || 1,
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Global Cap</label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={formData.maxUsageCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUsageCount: parseInt(e.target.value, 10) || 1000,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Active (Available for customer checkout)
              </label>
            </div>

            <div className="flex justify-end pt-4 space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingCoupon ? "Update Coupon" : "Save Coupon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}