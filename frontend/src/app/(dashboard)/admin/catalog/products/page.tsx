"use client";

import { useEffect, useState } from "react";
import { ProductDto, CategoryDto, BrandDto } from "@/src/types/catalog";
import { PaginationMeta } from "@/src/types/api";
import { productService } from "@/src/services/catalog/product-service";
import { categoryService } from "@/src/services/catalog/category-service";
import { brandService } from "@/src/services/catalog/brand-service";
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
import { Edit2, Plus, Trash2 } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [brands, setBrands] = useState<BrandDto[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    sku: "",
    price: 0,
    compareAtPrice: 0,
    costPrice: 0,
    stockQuantity: 0,
    lowStockThreshold: 10,
    isActive: true,
    isFeatured: false,
    imageFiles: [] as File[],
    imageUrls: [] as string[],
    tags: "",
    weight: 0,
    dimensions: "",
    categoryId: "",
    brandId: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll(page, pageSize);
      setProducts(res.data || []);
      setPagination(res.pagination);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        categoryService.getLookup(),
        brandService.getLookup()
      ]);
      setCategories(catsRes || []);
      setBrands(brandsRes || []);
    } catch (error) {
      console.error("Failed to fetch categories/brands for form dropdowns");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDependencies();
  }, [page, pageSize]);

  const handleOpenNew = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      sku: "",
      price: 0,
      compareAtPrice: 0,
      costPrice: 0,
      stockQuantity: 0,
      lowStockThreshold: 10,
      isActive: true,
      isFeatured: false,
      imageFiles: [],
      imageUrls: [],
      tags: "",
      weight: 0,
      dimensions: "",
      categoryId: categories.length > 0 ? categories[0].id : "",
      brandId: ""
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: ProductDto) => {
    setEditingProduct(product);
    setFormData({ 
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      sku: product.sku,
      price: product.price,
      compareAtPrice: product.compareAtPrice || 0,
      costPrice: product.costPrice || 0,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold || 10,
      isActive: product.isActive !== undefined ? product.isActive : true,
      isFeatured: product.isFeatured || false,
      imageFiles: [],
      imageUrls: product.imageUrls || [],
      tags: product.tags || "",
      weight: product.weight || 0,
      dimensions: product.dimensions || "",
      categoryId: product.categoryId,
      brandId: product.brandId || ""
    });
    setIsDialogOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingProduct) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      setFormData({ ...formData, name, slug });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, imageFiles: Array.from(e.target.files) });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.delete(id);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error("Category is required");
      return;
    }
    
    try {
      setSubmitting(true);
      
      const submitData = {
        ...formData,
        slug: formData.slug || undefined,
        brandId: formData.brandId === "" ? undefined : formData.brandId,
        compareAtPrice: formData.compareAtPrice === 0 ? undefined : formData.compareAtPrice,
        costPrice: formData.costPrice === 0 ? undefined : formData.costPrice
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, submitData);
        toast.success("Product updated successfully");
      } else {
        await productService.create(submitData);
        toast.success("Product created successfully");
      }
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(editingProduct ? "Failed to update product" : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your product catalog.</p>
        </div>
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">SKU</th>
              <th className="px-6 py-3 font-medium">Price</th>
              <th className="px-6 py-3 font-medium">Stock</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Brand</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{product.sku}</td>
                  <td className="px-6 py-4 font-medium">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-muted-foreground">{product.stockQuantity}</td>
                  <td className="px-6 py-4 text-muted-foreground">{product.categoryName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{product.brandName || "-"}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(product)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
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
            Showing <span className="font-medium">{products.length}</span> of <span className="font-medium">{pagination.totalCount}</span> results
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
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update the product details." : "Create a new product."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-6">
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Product name"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="product-slug"
                />
              </div>

              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">SKU</label>
                <Input
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="SKU-123"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Product Images</label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {formData.imageUrls.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {formData.imageUrls.map((url, i) => (
                      <img key={i} src={url.startsWith('http') ? url : `http://localhost:5001${url}`} alt="Product" className="w-16 h-16 object-cover rounded-md border" />
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Selecting new images will replace existing ones.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Compare At Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Cost Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tag1, tag2"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Stock Quantity</label>
                <Input
                  type="number"
                  required
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Low Stock Threshold</label>
                <Input
                  type="number"
                  required
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Weight</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Dimensions</label>
                <Input
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  placeholder="10x10x10"
                />
              </div>

              <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium">Category</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium">Brand</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                >
                  <option value="">No Brand</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-6 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">Active (visible in store)</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">Featured</span>
              </label>
            </div>

            <div className="flex justify-end pt-4 pb-10">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingProduct ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
