"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Pencil,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
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
  serviceableAreaService,
  ServiceableArea,
  CreateServiceableAreaPayload,
} from "@/src/services/serviceable-area-service";

export default function ServiceableAreasPage() {
  const [areas, setAreas] = useState<ServiceableArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog & Editing State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceableArea | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingId, setFetchingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateServiceableAreaPayload>({
    name: "",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "",
    latitude: 28.6280,
    longitude: 77.3649,
    radiusInKm: 5.0,
    isActive: true,
  });

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const data = await serviceableAreaService.getAll();
      setAreas(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch serviceable areas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleOpenAdd = () => {
    setEditingArea(null);
    setFormData({
      name: "",
      city: "Noida",
      state: "Uttar Pradesh",
      pincode: "",
      latitude: 28.6280,
      longitude: 77.3649,
      radiusInKm: 5.0,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  // Fetch hub details directly from GET API before opening edit dialog
  const handleOpenEdit = async (areaId: string) => {
    try {
      setFetchingId(areaId);
      const data = await serviceableAreaService.getById(areaId);
      if (data) {
        setEditingArea(data);
        setFormData({
          name: data.name,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          latitude: data.latitude,
          longitude: data.longitude,
          radiusInKm: data.radiusInKm,
          isActive: data.isActive,
        });
        setIsDialogOpen(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch delivery hub details from API");
    } finally {
      setFetchingId(null);
    }
  };

  const handleToggleActive = async (area: ServiceableArea) => {
    try {
      await serviceableAreaService.save(
        {
          name: area.name,
          city: area.city,
          state: area.state,
          pincode: area.pincode,
          latitude: area.latitude,
          longitude: area.longitude,
          radiusInKm: area.radiusInKm,
          isActive: !area.isActive,
        },
        area.id
      );
      toast.success(
        `Delivery hub "${area.name}" is now ${!area.isActive ? "Active" : "Disabled"}`
      );
      fetchAreas();
    } catch (err: any) {
      toast.error(err.message || "Failed to update hub status");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pincode) {
      toast.error("Hub name and pincode are required");
      return;
    }

    try {
      setIsSubmitting(true);
      await serviceableAreaService.save(formData, editingArea?.id);
      toast.success(
        editingArea
          ? `Updated delivery hub "${formData.name}"`
          : `Created delivery hub "${formData.name}"`
      );
      setIsDialogOpen(false);
      fetchAreas();
    } catch (err: any) {
      toast.error(err.message || "Failed to save delivery hub");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAreas = areas.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.pincode.includes(searchTerm)
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Serviceable Areas</h2>
          <p className="text-muted-foreground">
            Manage delivery hubs, geofence radius in kilometers, and active service zones.
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Delivery Hub
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96 relative">
          <Input
            placeholder="Search hub name, city, or pincode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Hub Table */}
      <div className="rounded-md border bg-card">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Hub Name</th>
              <th className="px-6 py-3 font-medium">City / State</th>
              <th className="px-6 py-3 font-medium">Pincode</th>
              <th className="px-6 py-3 font-medium">Coordinates (Lat, Lng)</th>
              <th className="px-6 py-3 font-medium">Delivery Radius</th>
              <th className="px-6 py-3 font-medium">Active Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading delivery hubs...
                  </div>
                </td>
              </tr>
            ) : filteredAreas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  No delivery hubs found.
                </td>
              </tr>
            ) : (
              filteredAreas.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {item.city}, {item.state}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{item.pincode}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                    {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {item.radiusInKm} KM
                    </span>
                  </td>
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={fetchingId === item.id}
                        onClick={() => handleOpenEdit(item.id)}
                        title="Fetch & Edit Delivery Hub"
                      >
                        {fetchingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Pencil className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Hub Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingArea ? "Edit Delivery Hub" : "Add Delivery Hub"}
            </DialogTitle>
            <DialogDescription>
              {editingArea
                ? `Update location details or radius for ${editingArea.name}.`
                : "Configure a new delivery hub center with latitude, longitude, and delivery radius in kilometers."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Hub / Area Name</label>
              <Input
                required
                placeholder="e.g. Sector 62 Hub - Noida"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">City</label>
                <Input
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Pincode</label>
                <Input
                  required
                  placeholder="201309"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Latitude</label>
                <Input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Longitude</label>
                <Input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Radius (KM)</label>
                <Input
                  type="number"
                  step="0.1"
                  required
                  value={formData.radiusInKm}
                  onChange={(e) =>
                    setFormData({ ...formData, radiusInKm: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingArea ? "Update Hub" : "Save Delivery Hub"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
