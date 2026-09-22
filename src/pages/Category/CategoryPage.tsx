import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, FolderOpen, Download, LayoutGrid, List } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import {
  clearCategoryError,
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
  type Category,
} from "../../store/slice/categorySlice";
import Button from "../../components/Button";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import ImageUploadField from "../../components/ImageUploadField";
import CustomImage from "../../components/Image";
import DotMenu from "../../components/DotMenu";
import { FetchApi } from "../../api/Fetch";
import { exportTableData } from "../../utils/exportToExcel";

const makeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function CategoryPage() {
  const dispatch = useAppDispatch();
  const { categories, isLoading, error, message } = useAppSelector((state: any) => state.category);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });

  const uploadImageToServer = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await FetchApi<{ success: boolean; data?: { imageUrl?: string } }>({
      endpoint: "/upload",
      method: "POST",
      body: formData,
      token: (useAppSelector((state: any) => state.auth.accessToken) ?? "") || undefined,
    });

    const uploadedUrl = response?.data?.imageUrl || "";
    if (!uploadedUrl) {
      throw new Error("Image upload failed");
    }

    return uploadedUrl;
  };

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      dispatch(addToast({ type: "success", text: message }));
      dispatch(clearCategoryError());
      setForm({ name: "", description: "", image: "", isActive: true });
      setEditingId(null);
      setIsFormOpen(false);
      dispatch(getAllCategories());
    }

    if (error) {
      dispatch(addToast({ type: "error", text: error }));
      dispatch(clearCategoryError());
    }
  }, [message, error, dispatch]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((item: Category) => {
      return (
        item.name.toLowerCase().includes(query) ||
        (item.description || "").toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query)
      );
    });
  }, [categories, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      dispatch(addToast({ type: "error", text: "Category name is required" }));
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: makeSlug(form.name),
      description: form.description.trim(),
      image: form.image.trim(),
      isActive: form.isActive,
    };

    if (editingId) {
      await dispatch(updateCategory({ id: editingId, data: payload }));
    } else {
      await dispatch(createCategory(payload));
    }
  };

  const openEdit = (category: Category) => {
    setEditingId(category._id);
    setForm({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive ?? true,
    });
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", description: "", image: "", isActive: true });
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await dispatch(deleteCategory(deleteId));
    setDeleteId(null);
  };

  const handleExport = () => {
    exportTableData(
      filteredCategories,
      [
        { key: "name", header: "Name", accessor: "name" },
        { key: "slug", header: "Slug", accessor: "slug" },
        { key: "description", header: "Description", accessor: (row: Category) => row.description || "" },
        { key: "status", header: "Status", accessor: (row: Category) => (row.isActive ? "Active" : "Inactive") },
      ],
      "Categories"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">Manage product groupings for your store</p>
        </div>

        {!isFormOpen && (
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus size={16} />
            Add category
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit category" : "Create category"}</h2>
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
                placeholder="Men T-Shirts"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                placeholder="Describe this category"
              />
            </div>

            <div className="md:col-span-2">
              <ImageUploadField
                label="Category image"
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
                  <CustomImage src={form.image} alt={form.name || "Category image"} className="h-28 w-28 rounded-xl object-cover border border-slate-200" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="category-status"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-orange-600"
              />
              <label htmlFor="category-status" className="text-sm text-slate-700">Active</label>
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
              >
                Cancel
              </button>
              <Button type="submit"  disabled={isLoading}>
                {isLoading ? "Saving..." : editingId ? "Update category" : "Create category"}
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
                  placeholder="Search categories"
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
              {filteredCategories.length === 0 ? (
                <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                  <FolderOpen className="mx-auto mb-3 text-slate-300" size={32} />
                  No categories found.
                </div>
              ) : (
                filteredCategories.map((category: Category) => (
                  <div key={category._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {category.image ? (
                          <CustomImage src={category.image} alt={category.name} className="h-11 w-11 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-lg font-bold text-orange-600">
                            {category.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{category.name}</h3>
                          <p className="text-xs text-slate-500">/{category.slug}</p>
                        </div>
                      </div>

                      <DotMenu
                        onEdit={() => openEdit(category)}
                        onDelete={() => setDeleteId(category._id)}
                      />
                    </div>

                    <p className="text-sm text-slate-600">{category.description || "No description added yet."}</p>

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className={`rounded-full px-2 py-1 ${category.isActive === false ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}>
                        {category.isActive === false ? "Inactive" : "Active"}
                      </span>
                      <span className="text-slate-400">{category.image ? "Has image" : "No image"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCategories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                  <FolderOpen className="mx-auto mb-3 text-slate-300" size={32} />
                  No categories found.
                </div>
              ) : (
                filteredCategories.map((category: Category) => (
                  <div key={category._id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <CustomImage src={category.image} alt={category.name} className="h-12 w-12 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-lg font-bold text-orange-600">
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-slate-900">{category.name}</h3>
                        <p className="text-xs text-slate-500">{category.slug || "category"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${category.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                        aria-label="Edit category"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(category._id)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        aria-label="Delete category"
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
        title="Delete this category?"
        loading={isLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
