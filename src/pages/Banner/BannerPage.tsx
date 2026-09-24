import { useEffect, useState } from "react";
import { Plus, Download, ImageIcon } from "lucide-react";
import Button from "../../components/Button";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { FetchApi } from "../../api/Fetch";
import { useAppSelector, useAppDispatch } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import ImageUploadField from "../../components/ImageUploadField";
import CustomImage from "../../components/Image";
import DotMenu from "../../components/DotMenu";
import { exportTableData } from "../../utils/exportToExcel";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";

type BannerItem = {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  imagePublicId?: string;
  link?: string;
  isActive?: boolean;
  sortOrder?: number;
};

type BannerForm = {
  title: string;
  subtitle: string;
  image: string;
  imageFile: File | null;
  link: string;
  isActive: boolean;
  sortOrder: string;
};

const emptyForm = (): BannerForm => ({
  title: "",
  subtitle: "",
  image: "",
  imageFile: null,
  link: "",
  isActive: true,
  sortOrder: "1",
});

export default function BannerPage() {
  const dispatch = useAppDispatch();

  const { accessToken } = useAppSelector((state: any) => state.auth);

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<BannerForm>(emptyForm());

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

      const items = Array.isArray(response?.data)
        ? response.data
        : (response?.data ?? []);

      setBanners(items as BannerItem[]);
    } catch (err: any) {
      dispatch(
        addToast({
          type: "error",
          text: err?.message || "Failed to load banners",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [accessToken]);

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
      imageFile: null,
      link: banner.link || "",
      isActive: banner.isActive ?? true,
      sortOrder: String(banner.sortOrder ?? 1),
    });

    setIsFormOpen(true);
  };

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setForm((prev) => ({
        ...prev,
        image: editingId ? prev.image : "",
        imageFile: null,
      }));

      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setForm((prev) => {
      if (prev.image?.startsWith("blob:")) {
        URL.revokeObjectURL(prev.image);
      }

      return {
        ...prev,
        image: previewUrl,
        imageFile: file,
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      dispatch(
        addToast({
          type: "error",
          text: "Title is required",
        }),
      );

      return;
    }

    if (!editingId && !form.imageFile) {
      dispatch(
        addToast({
          type: "error",
          text: "Banner image is required",
        }),
      );

      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", form.title.trim());
      formData.append("subtitle", form.subtitle.trim());
      formData.append("link", form.link.trim());
      formData.append("isActive", String(form.isActive));
      formData.append("sortOrder", String(Number(form.sortOrder || 1)));

      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      if (editingId) {
        await FetchApi({
          endpoint: `/banners/${editingId}`,
          method: "PUT",
          token: accessToken,
          body: formData,
        });

        dispatch(
          addToast({
            type: "success",
            text: "Banner updated successfully",
          }),
        );
      } else {
        await FetchApi({
          endpoint: "/banners",
          method: "POST",
          token: accessToken,
          body: formData,
        });

        dispatch(
          addToast({
            type: "success",
            text: "Banner created successfully",
          }),
        );
      }

      if (form.image?.startsWith("blob:")) {
        URL.revokeObjectURL(form.image);
      }

      setIsFormOpen(false);
      setEditingId(null);
      setForm(emptyForm());

      await fetchBanners();
    } catch (err: any) {
      dispatch(
        addToast({
          type: "error",
          text: err?.message || "Unable to save banner",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setLoading(true);

    try {
      await FetchApi({
        endpoint: `/banners/${deleteId}`,
        method: "DELETE",
        token: accessToken,
      });

      dispatch(
        addToast({
          type: "success",
          text: "Banner deleted successfully",
        }),
      );

      setDeleteId(null);

      await fetchBanners();
    } catch (err: any) {
      dispatch(
        addToast({
          type: "error",
          text: err?.message || "Failed to delete banner",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportTableData(
      banners,
      [
        {
          key: "title",
          header: "Title",
          accessor: "title",
        },
        {
          key: "subtitle",
          header: "Subtitle",
          accessor: (row: BannerItem) => row.subtitle || "",
        },
        {
          key: "link",
          header: "Link",
          accessor: (row: BannerItem) => row.link || "",
        },
        {
          key: "sortOrder",
          header: "Order",
          accessor: (row: BannerItem) => row.sortOrder ?? 1,
        },
        {
          key: "status",
          header: "Status",
          accessor: (row: BannerItem) => (row.isActive ? "Active" : "Inactive"),
        },
      ],
      "Banners",
    );
  };

  const columns: ColumnDef<BannerItem>[] = [
    {
      key: "image",
      header: "Image",
      accessor: "image",
      width: 110,
      render: (value, row) => (
        <div className="h-12 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {value ? (
            <CustomImage
              src={String(value)}
              alt={row.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon size={20} className="text-slate-300" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Title",
      accessor: "title",
      sortable: true,
    },
    {
      key: "subtitle",
      header: "Subtitle",
      accessor: (row: BannerItem) => row.subtitle || "",
      render: (value) => (
        <div className="max-w-xs truncate text-sm text-slate-600">
          {String(value || "No subtitle")}
        </div>
      ),
    },
    {
      key: "link",
      header: "Link",
      accessor: (row: BannerItem) => row.link || "",
      render: (value) => (
        <div className="max-w-xs truncate text-sm text-slate-500">
          {String(value || "No link")}
        </div>
      ),
    },
    {
      key: "sortOrder",
      header: "Order",
      accessor: (row: BannerItem) => row.sortOrder ?? 1,
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (row: BannerItem) => (row.isActive ? "Active" : "Inactive"),
      sortable: true,
      render: (value, row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            row.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {String(value)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: "_id",
      align: "right",
      render: (_, row) => (
        <div onClick={(event) => event.stopPropagation()}>
          <DotMenu
            onEdit={() => openEdit(row)}
            onDelete={() => setDeleteId(row._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Banners</h1>

          <p className="text-sm text-slate-500">
            Manage homepage promotional banners
          </p>
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
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId ? "Edit banner" : "Create banner"}
            </h2>

            <button
              type="button"
              onClick={() => {
                if (form.image?.startsWith("blob:")) {
                  URL.revokeObjectURL(form.image);
                }

                setIsFormOpen(false);
              }}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600"
            >
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Title
              </label>

              <input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Subtitle
              </label>

              <textarea
                value={form.subtitle}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    subtitle: e.target.value,
                  }))
                }
                className="h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div className="md:col-span-2">
              <ImageUploadField
                label="Banner image"
                value={form.image || null}
                onChange={handleImageChange}
              />

              {form.image && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <CustomImage
                    src={form.image}
                    alt={form.title || "Banner image"}
                    className="h-52 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Link
              </label>

              <input
                value={form.link}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    link: e.target.value,
                  }))
                }
                placeholder="/products"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sort Order
              </label>

              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sortOrder: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="banner-status"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-orange-600"
              />

              <label htmlFor="banner-status" className="text-sm text-slate-700">
                Active
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  if (form.image?.startsWith("blob:")) {
                    URL.revokeObjectURL(form.image);
                  }

                  setIsFormOpen(false);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
              >
                Cancel
              </button>

              <Button
                type="submit"
                disabled={loading}
                className="bg-[#3A29AA] hover:bg-[#2d1f81]"
              >
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Update banner"
                    : "Create banner"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {!isFormOpen && (
        <DataTable
          data={banners}
          columns={columns}
          rowKey="_id"
          searchKeys={["title", "subtitle", "link"]}
          searchPlaceholder="Search banners..."
          defaultView="grid"
          loading={loading}
          pageSize={10}
          pageSizeOptions={[10, 20, 50, 100]}
          paginationMode="client"
          actions={
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-sm"
            >
              <Download size={15} />
              Export
            </Button>
          }
          gridClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
          renderGridCard={(banner: BannerItem) => (
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                {banner.image ? (
                  <CustomImage
                    src={banner.image}
                    alt={banner.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100">
                    <ImageIcon className="text-slate-300" size={40} />
                  </div>
                )}

                <div className="absolute right-3 top-3">
                  <DotMenu
                    onEdit={() => openEdit(banner)}
                    onDelete={() => setDeleteId(banner._id)}
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/75 to-transparent px-4 pb-4 pt-12">
                  <div className="min-w-0">
                    <span className="block max-w-[180px] truncate rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800">
                      {banner.title}
                    </span>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-semibold ${
                      banner.isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-500 text-white"
                    }`}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          )}
        />
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
