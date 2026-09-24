import { useEffect, useState } from "react";
import { Plus, Download, FolderOpen } from "lucide-react";
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
import CustomImage from "../../components/Image";
import DotMenu from "../../components/DotMenu";
import { exportTableData } from "../../utils/exportToExcel";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import ReusableForm, { type FormField } from "../../components/ReusableForm";

const makeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function CategoryPage() {
  const dispatch = useAppDispatch();

  const { categories, isLoading, error, message } = useAppSelector(
    (state: any) => state.category,
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      dispatch(
        addToast({
          type: "success",
          text: message,
        }),
      );

      dispatch(clearCategoryError());
      setEditingId(null);
      setIsFormOpen(false);
      dispatch(getAllCategories());
    }

    if (error) {
      dispatch(
        addToast({
          type: "error",
          text: error,
        }),
      );

      dispatch(clearCategoryError());
    }
  }, [message, error, dispatch]);

  const openEdit = (category: Category) => {
    setEditingId(category._id);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    await dispatch(deleteCategory(deleteId));
    setDeleteId(null);
  };

  const getInitialValues = (category?: Category | null) => {
    if (!category) {
      return {
        name: "",
        description: "",
        image: null,
        isActive: true,
      };
    }

    return {
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive ?? true,
    };
  };

  const editingCategory = editingId
    ? categories.find((category: Category) => category._id === editingId) ||
      null
    : null;

  const fields: FormField[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "Men T-Shirts",
      required: true,
      fullWidth: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Describe this category",
      fullWidth: true,
    },
    {
      name: "image",
      label: "Category image",
      type: "file",
      fullWidth: true,
    },
    {
      name: "isActive",
      label: "Active",
      type: "checkbox",
      fullWidth: true,
    },
  ];

  const handleSubmit = async (values: Record<string, any>) => {
    if (!values.name?.trim()) {
      dispatch(
        addToast({
          type: "error",
          text: "Category name is required",
        }),
      );

      return;
    }

    const imageFile = values.image instanceof File ? values.image : null;

    if (!editingId && !imageFile) {
      dispatch(
        addToast({
          type: "error",
          text: "Category image is required",
        }),
      );

      return;
    }

    const formData = new FormData();

    formData.append("name", values.name.trim());

    formData.append("slug", makeSlug(values.name));

    formData.append("description", values.description?.trim() || "");

    formData.append("isActive", String(Boolean(values.isActive)));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (editingId) {
      await dispatch(
        updateCategory({
          id: editingId,
          data: formData,
        }),
      );
    } else {
      await dispatch(createCategory(formData));
    }
  };

  const handleExport = () => {
    exportTableData(
      categories,
      [
        {
          key: "name",
          header: "Name",
          accessor: "name",
        },
        {
          key: "slug",
          header: "Slug",
          accessor: "slug",
        },
        {
          key: "description",
          header: "Description",
          accessor: (row: Category) => row.description || "",
        },
        {
          key: "status",
          header: "Status",
          accessor: (row: Category) => (row.isActive ? "Active" : "Inactive"),
        },
      ],
      "Categories",
    );
  };

  const columns: ColumnDef<Category>[] = [
    {
      key: "image",
      header: "Image",
      accessor: "image",
      width: 100,
      render: (value, row) => (
        <div className="h-12 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {value ? (
            <CustomImage
              src={String(value)}
              alt={row.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FolderOpen size={20} className="text-slate-300" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Name",
      accessor: "name",
      sortable: true,
    },
    {
      key: "slug",
      header: "Slug",
      accessor: "slug",
      sortable: true,
    },
    {
      key: "description",
      header: "Description",
      accessor: (row: Category) => row.description || "",
      render: (value) => (
        <div className="max-w-xs truncate text-sm text-slate-600">
          {String(value || "No description")}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (row: Category) => (row.isActive ? "Active" : "Inactive"),
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
        <div onClick={(e) => e.stopPropagation()}>
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Categories</h1>

          <p className="text-sm text-slate-500">
            Manage product groupings for your store
          </p>
        </div>

        {!isFormOpen && (
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus size={16} />
            Add category
          </Button>
        )}
      </div>

      {isFormOpen && (
        <ReusableForm
          title={editingId ? "Edit category" : "Create category"}
          fields={fields}
          initialValues={getInitialValues(editingCategory)}
          submitText={editingId ? "Update category" : "Create category"}
          onClose={() => {
            setIsFormOpen(false);
            setEditingId(null);
          }}
          loading={isLoading}
          onSubmit={handleSubmit}
          resetKey={editingId ?? "new"}
        />
      )}

      {!isFormOpen && (
        <DataTable
          data={categories}
          columns={columns}
          rowKey="_id"
          searchKeys={["name", "slug", "description"]}
          searchPlaceholder="Search categories..."
          defaultView="grid"
          loading={isLoading}
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
          gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          renderGridCard={(category: Category) => (
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                {category.image ? (
                  <CustomImage
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100">
                    <FolderOpen className="text-slate-300" size={42} />
                  </div>
                )}

                <div className="absolute right-3 top-3">
                  <DotMenu
                    onEdit={() => openEdit(category)}
                    onDelete={() => setDeleteId(category._id)}
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/75 to-transparent px-4 pb-4 pt-12">
                  <span className="max-w-[70%] truncate rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800">
                    {category.name}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1.5 text-xs font-semibold ${
                      category.isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-500 text-white"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          )}
        />
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
