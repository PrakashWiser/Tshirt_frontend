import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, ImageIcon, Download, LayoutGrid, List } from "lucide-react";
import Button from "../../components/Button";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { FetchApi } from "../../api/Fetch";
import { useAppSelector } from "../../hooks/hooks";
import { useAppDispatch } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import ImageUploadField from "../../components/ImageUploadField";
import CustomImage from "../../components/Image";
import DotMenu from "../../components/DotMenu";
import { exportTableData } from "../../utils/exportToExcel";

type BannerItem = {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive?: boolean;
  sortOrder?: number;
};

type BannerForm = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
  sortOrder: string;
};

const emptyForm = (): BannerForm => ({
  title: "",
  subtitle: "",
  image: "",
  link: "",
  isActive: true,
  sortOrder: "1",
});

export default function BannerPage() {
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state: any) => state.auth);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<BannerForm>(emptyForm());

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

  const fetchBanners = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const res = await FetchApi<any>({
        endpoint: "/banners/all",
        method: "GET",
        token: accessToken,
      });
      const response = res as any;
      const items = Array.isArray(response?.data) ? response.data : response?.data ?? [];
      setBanners(items as BannerItem[]);
    } catch (err: any) {
      dispatch(addToast({ type: "error", text: err?.message || "Failed to load banners" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [accessToken]);

  const filteredBanners = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return banners;

    return banners.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      (item.subtitle || "").toLowerCase().includes(query) ||
      (item.link || "").toLowerCase().includes(query)
    );
  }, [banners, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setIsFormOpen(true);
  };

  const openEdit = (banner: BannerItem) => {
    setEditingId(banner._id);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image: banner.image || "",
      link: banner.link || "",
      isActive: banner.isActive ?? true,
      sortOrder: String(banner.sortOrder ?? 1),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim() || !form.image.trim()) {
      dispatch(addToast({ type: "error", text: "Title and image are required" }));
      return;
    }

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      image: form.image.trim(),
      link: form.link.trim(),
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder || 1),
    };

    try {
      if (editingId) {
        await FetchApi({
          endpoint: `/banners/${editingId}`,
          method: "PUT",
          token: accessToken,
          body: payload,
        });
        dispatch(addToast({ type: "success", text: "Banner updated successfully" }));
      } else {
        await FetchApi({
          endpoint: "/banners",
          method: "POST",
          token: accessToken,
          body: payload,
        });
        dispatch(addToast({ type: "success", text: "Banner created successfully" }));
      }

      setIsFormOpen(false);
      setEditingId(null);
      setForm(emptyForm());
      fetchBanners();
    } catch (err: any) {
      dispatch(addToast({ type: "error", text: err?.message || "Unable to save banner" }));
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await FetchApi({
        endpoint: `/banners/${deleteId}`,
        method: "DELETE",
        token: accessToken,
      });
      dispatch(addToast({ type: "success", text: "Banner deleted successfully" }));
      setDeleteId(null);
      fetchBanners();
    } catch (err: any) {
      dispatch(addToast({ type: "error", text: err?.message || "Failed to delete banner" }));
    }
  };

  const handleExport = () => {
    exportTableData(
      filteredBanners,
      [
        { key: "title", header: "Title", accessor: "title" },
        { key: "subtitle", header: "Subtitle", accessor: (row: BannerItem) => row.subtitle || "" },
        { key: "link", header: "Link", accessor: (row: BannerItem) => row.link || "" },
        { key: "sortOrder", header: "Order", accessor: (row: BannerItem) => row.sortOrder ?? 1 },
        { key: "status", header: "Status", accessor: (row: BannerItem) => (row.isActive ? "Active" : "Inactive") },
      ],
      "Banners"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Banners</h1>
          <p className="text-sm text-slate-500">Manage homepage promotional banners</p>
        </div>

        {!isFormOpen && (
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus size={16} />
            Add banner
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit banner" : "Create banner"}</h2>
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
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Subtitle</label>
              <textarea
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div className="md:col-span-2">
              <ImageUploadField
                label="Banner image"
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
                <div className="mt-3 md:col-span-2">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <CustomImage src={form.image} alt={form.title || "Banner image"} className="h-52 w-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Link</label>
              <input
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="/products"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="banner-status"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-orange-600"
              />
              <label htmlFor="banner-status" className="text-sm text-slate-700">Active</label>
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
                {loading ? "Saving..." : editingId ? "Update banner" : "Create banner"}
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
                  placeholder="Search banners"
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
              {filteredBanners.length === 0 ? (
                <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                  <ImageIcon className="mx-auto mb-3 text-slate-300" size={32} />
                  No banners found.
                </div>
              ) : (
                filteredBanners.map((banner) => (
                  <div key={banner._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {banner.image ? (
                          <CustomImage src={banner.image} alt={banner.title} className="h-11 w-11 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-lg font-bold text-[#3A29AA]">
                            {banner.title?.charAt(0)?.toUpperCase() || "B"}
                          </div>
                        )}
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{banner.title}</h3>
                          <p className="text-xs text-slate-500">Order {banner.sortOrder ?? 1}</p>
                        </div>
                      </div>

                      <DotMenu
                        onEdit={() => openEdit(banner)}
                        onDelete={() => setDeleteId(banner._id)}
                      />
                    </div>

                    <p className="text-sm text-slate-600">{banner.subtitle || "No subtitle added yet."}</p>

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className={`rounded-full px-2 py-1 ${banner.isActive === false ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}>
                        {banner.isActive === false ? "Inactive" : "Active"}
                      </span>
                      <span className="text-slate-500">{banner.link || "No link"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBanners.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                  <ImageIcon className="mx-auto mb-3 text-slate-300" size={32} />
                  No banners found.
                </div>
              ) : (
                filteredBanners.map((banner) => (
                  <div key={banner._id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      {banner.image ? (
                        <CustomImage src={banner.image} alt={banner.title} className="h-12 w-20 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-lg font-bold text-[#3A29AA]">
                          {banner.title?.charAt(0)?.toUpperCase() || "B"}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-slate-900">{banner.title}</h3>
                        <p className="text-xs text-slate-500">{banner.subtitle || "No subtitle"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${banner.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                      <button
                        type="button"
                        onClick={() => openEdit(banner)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                        aria-label="Edit banner"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(banner._id)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        aria-label="Delete banner"
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
        title="Delete this banner?"
        loading={loading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
