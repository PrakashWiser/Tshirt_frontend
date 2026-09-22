import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, PackageOpen, Download, LayoutGrid, List } from "lucide-react";
import Button from "../../components/Button";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { FetchApi } from "../../api/Fetch";
import { useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import { useAppDispatch } from "../../hooks/hooks";
import ImageUploadField from "../../components/ImageUploadField";
import CustomImage from "../../components/Image";
import DotMenu from "../../components/DotMenu";
import { exportTableData } from "../../utils/exportToExcel";

type CategoryOption = {
  _id: string;
  name: string;
  slug?: string;
};

type ProductItem = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  price?: number;
  category?: string | CategoryOption;
  image?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  stock?: number;
  isActive?: boolean;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  sizes: string;
  colors: string;
  stock: string;
  isActive: boolean;
};

const emptyForm = (): ProductForm => ({
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  sizes: "",
  colors: "",
  stock: "",
  isActive: true,
});

const makeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function ProductPage() {
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state: any) => state.auth);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm());

  const uploadImageToServer = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await FetchApi<{ success: boolean; data?: { imageUrl?: string } }>({
      endpoint: "/upload",
      method: "POST",
      body: formData,
      token: accessToken ?? "",
    });

    const uploadedUrl = response?.data?.imageUrl || "";
    if (!uploadedUrl) {
      throw new Error("Image upload failed");
    }

    return uploadedUrl;
  };

  const fetchCategories = async () => {
    if (!accessToken) return;

    try {
      const res = await FetchApi<any>({
        endpoint: "/categories",
        method: "GET",
        token: accessToken,
      });
      const response = res as any;
      const items = Array.isArray(response?.data) ? response.data : response?.categories ?? [];
      setCategories(items as CategoryOption[]);
    } catch {
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const res = await FetchApi<any>({
        endpoint: "/products",
        method: "GET",
        token: accessToken,
      });
      const response = res as any;
      const items = Array.isArray(response?.data) ? response.data : response?.products ?? [];
      setProducts(items as ProductItem[]);
    } catch (err: any) {
      dispatch(addToast({ type: "error", text: err?.message || "Failed to load products" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [accessToken]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((item) => {
      const categoryName = typeof item.category === "string" ? item.category : item.category?.name ?? "";
      return (
        item.name.toLowerCase().includes(query) ||
        (item.description || "").toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query)
      );
    });
  }, [products, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setIsFormOpen(true);
  };

  const openEdit = (product: ProductItem) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      category: typeof product.category === "string" ? product.category : product.category?._id || "",
      image: product.image || product.images?.[0] || "",
      sizes: (product.sizes || []).join(", "),
      colors: (product.colors || []).join(", "),
      stock: String(product.stock ?? ""),
      isActive: product.isActive ?? true,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      dispatch(addToast({ type: "error", text: "Product name is required" }));
      return;
    }

    if (!form.category) {
      dispatch(addToast({ type: "error", text: "Please select a category" }));
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: makeSlug(form.name),
      description: form.description.trim(),
      price: Number(form.price || 0),
      category: form.category,
      image: form.image.trim(),
      images: form.image ? [form.image.trim()] : [],
      sizes: form.sizes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      colors: form.colors
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      stock: Number(form.stock || 0),
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await FetchApi({
          endpoint: `/products/${editingId}`,
          method: "PUT",
          token: accessToken,
          body: payload,
        });
        dispatch(addToast({ type: "success", text: "Product updated successfully" }));
      } else {
        await FetchApi({
          endpoint: "/products",
          method: "POST",
          token: accessToken,
          body: payload,
        });
        dispatch(addToast({ type: "success", text: "Product created successfully" }));
      }

      setIsFormOpen(false);
      setEditingId(null);
      setForm(emptyForm());
      fetchProducts();
    } catch (err: any) {
      dispatch(addToast({ type: "error", text: err?.message || "Unable to save product" }));
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await FetchApi({
        endpoint: `/products/${deleteId}`,
        method: "DELETE",
        token: accessToken,
      });
      dispatch(addToast({ type: "success", text: "Product deleted successfully" }));
      setDeleteId(null);
      fetchProducts();
    } catch (err: any) {
      dispatch(addToast({ type: "error", text: err?.message || "Failed to delete product" }));
    }
  };

  const handleExport = () => {
    exportTableData(
      filteredProducts,
      [
        { key: "name", header: "Name", accessor: "name" },
        { key: "slug", header: "Slug", accessor: "slug" },
        { key: "price", header: "Price", accessor: (row: ProductItem) => row.price ?? 0 },
        { key: "category", header: "Category", accessor: (row: ProductItem) => typeof row.category === "string" ? row.category : row.category?.name || "" },
        { key: "stock", header: "Stock", accessor: (row: ProductItem) => row.stock ?? 0 },
        { key: "status", header: "Status", accessor: (row: ProductItem) => (row.isActive ? "Active" : "Inactive") },
      ],
      "Products"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage product catalog and inventory</p>
        </div>

        {!isFormOpen && (
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus size={16} />
            Add product
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit product" : "Create product"}</h2>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600"
            >
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Price</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <ImageUploadField
                label="Product image"
                value={form.image || null}
                onChange={async (file) => {
                  if (!file) {
                    setForm({ ...form, image: "" });
                    return;
                  }

                  try {
                    const uploadedUrl = await uploadImageToServer(file);
                    setForm({ ...form, image: uploadedUrl });
                  } catch (err: any) {
                    dispatch(addToast({ type: "error", text: err?.message || "Image upload failed" }));
                  }
                }}
              />

              {form.image && (
                <div className="mt-3">
                  <CustomImage src={form.image} alt={form.name || "Product image"} className="h-24 w-24 rounded-xl object-cover border border-slate-200" />
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Sizes</label>
              <input
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                placeholder="S, M, L"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Colors</label>
              <input
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                placeholder="Red, Black"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-8">
              <input
                id="product-status"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-orange-600"
              />
              <label htmlFor="product-status" className="text-sm text-slate-700">Active</label>
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
              >
                Cancel
              </button>
              <Button type="submit" disabled={loading} className="bg-[#3A29AA] hover:bg-[#2d1f81]">
                {loading ? "Saving..." : editingId ? "Update product" : "Create product"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {!isFormOpen && (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400"
                />
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-sm"
                >
                  <Download size={15} />
                  Export
                </Button>

                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm ${viewMode === "grid" ? "bg-[#3A29AA] text-white" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    <LayoutGrid size={14} />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm ${viewMode === "list" ? "bg-[#3A29AA] text-white" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    <List size={14} />
                    <span className="hidden sm:inline">List</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.length === 0 ? (
                <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                  <PackageOpen className="mx-auto mb-3 text-slate-300" size={32} />
                  No products found.
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {product.image || product.images?.[0] ? (
                          <CustomImage src={product.image || product.images?.[0] || ""} alt={product.name} className="h-11 w-11 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-lg font-bold text-[#3A29AA]">
                            {product.name?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                        )}
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
                          <p className="text-xs text-slate-500">/{product.slug || "product"}</p>
                        </div>
                      </div>

                      <DotMenu
                        onEdit={() => openEdit(product)}
                        onDelete={() => setDeleteId(product._id)}
                      />
                    </div>

                    <p className="text-sm text-slate-600">{product.description || "No description added yet."}</p>

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-slate-500">{product.stock ?? 0} in stock</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                  <PackageOpen className="mx-auto mb-3 text-slate-300" size={32} />
                  No products found.
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      {product.image || product.images?.[0] ? (
                        <CustomImage src={product.image || product.images?.[0] || ""} alt={product.name} className="h-12 w-12 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-lg font-bold text-[#3A29AA]">
                          {product.name?.charAt(0)?.toUpperCase() || "P"}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-slate-900">{product.name}</h3>
                        <p className="text-xs text-slate-500">{product.slug || "product"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                        aria-label="Edit product"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(product._id)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        aria-label="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteId)}
        title="Delete this product?"
        loading={loading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
