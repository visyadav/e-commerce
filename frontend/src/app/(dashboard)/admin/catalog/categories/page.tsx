"use client";

import { useEffect, useState } from "react";
import { CategoryDto } from "@/src/types/catalog";
import { PaginationMeta } from "@/src/types/api";
import { categoryService } from "@/src/services/catalog/category-service";
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
import { Edit2, Plus, Trash2, Loader2 } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ 
    name: "", 
    slug: "",
    description: "", 
    imageUrl: "",
    sortOrder: 0, 
    parentCategoryId: "",
    isActive: true 
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll(page, pageSize);
      setCategories(res.data || []);
      setPagination(res.pagination);
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, pageSize]);

  const handleOpenNew = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "", imageUrl: "", sortOrder: 0, parentCategoryId: "", isActive: true });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = async (category: CategoryDto) => {
    try {
      setLoadingEditId(category.id);
      const freshCategory = await categoryService.getById(category.id);
      if (freshCategory) {
        setEditingCategory(freshCategory);
        setFormData({ 
          name: freshCategory.name, 
          slug: freshCategory.slug,
          description: freshCategory.description || "",
          imageUrl: freshCategory.imageUrl || "",
          sortOrder: freshCategory.sortOrder,
          parentCategoryId: freshCategory.parentCategoryId || "",
          isActive: freshCategory.isActive !== undefined ? freshCategory.isActive : true
        });
        setIsDialogOpen(true);
      } else {
        toast.error("Failed to load category details");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while loading category details");
    } finally {
      setLoadingEditId(null);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingCategory) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      setFormData({ ...formData, name, slug });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoryService.delete(id);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const submitData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        imageUrl: formData.imageUrl,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
        parentCategoryId: formData.parentCategoryId === "" ? undefined : formData.parentCategoryId
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, submitData);
        toast.success("Category updated successfully");
      } else {
        await categoryService.create(submitData);
        toast.success("Category created successfully");
      }
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(editingCategory ? "Failed to update category" : "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Manage your product categories.</p>
        </div>
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Slug</th>
              <th className="px-6 py-3 font-medium">Parent Category</th>
              <th className="px-6 py-3 font-medium">Sort Order</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{category.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{category.slug}</td>
                  <td className="px-6 py-4 text-muted-foreground">{category.parentCategoryName || "-"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{category.sortOrder}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(category)} disabled={loadingEditId === category.id}>
                      {loadingEditId === category.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{categories.length}</span> of <span className="font-medium">{pagination.totalCount}</span> results
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the category details." : "Create a new category."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Category name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="category-slug"
                />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category description"
                />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.png"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Sort Order</label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Parent Category ID</label>
                <Input
                  value={formData.parentCategoryId}
                  onChange={(e) => setFormData({ ...formData, parentCategoryId: e.target.value })}
                  placeholder="Optional Parent ID"
                />
              </div>
              <div className="flex flex-col gap-2 col-span-2 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span className="text-sm font-medium">Active (visible in store)</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingCategory ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
