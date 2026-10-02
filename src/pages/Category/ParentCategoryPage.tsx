import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Power } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import Button from "../../components/Button";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import CustomImage from "../../components/Image";
import DotMenu from "../../components/DotMenu";
import ReusableForm, { type FormField } from "../../components/ReusableForm";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import { exportTableData } from "../../utils/exportToExcel";
import type { ParentCategory } from "../../types/category";

interface ParentCategoryFormValues {
  name?: string;
  description?: string;
  status?: boolean;
  image?: File | string | null;
}
import {
  createParentCategory,
  deleteParentCategory,
  getParentCategories,
  updateParentCategory,
} from "../../store/slice/parentCategorySlice";
import type { RootState } from "../../store/store";

export default function ParentCategoryPage() {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector(
    (state: RootState) => state.parentCategories,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const editingCategory =
    items.find((item: ParentCategory) => item._id === editingId) || null;
  const initialValues = useMemo(
    () => ({
      name: editingCategory?.name || "",
      description: editingCategory?.description || "",
      image: editingCategory?.image || "",
      status: editingCategory?.status ?? editingCategory?.isActive ?? true,
    }),
    [editingCategory],
  );

  const fields: FormField[] = [
    {
      name: "name",
      label: "Parent Category Name",
      type: "text",
      placeholder: "Men",
      required: true,
      fullWidth: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      fullWidth: true,
    },
    { name: "image", label: "Image", type: "file", fullWidth: true },
    { name: "status", label: "Active", type: "checkbox", fullWidth: true },
  ];

  useEffect(() => {
    dispatch(getParentCategories(false))
      .unwrap()
      .catch((error: unknown) => {
        dispatch(
          addToast({
            type: "error",
            text:
              error instanceof Error
                ? error.message
                : "Failed to load parent categories",
          }),
        );
      });
  }, [dispatch]);

  const save = async (values: ParentCategoryFormValues) => {
    if (!values.name?.trim()) {
      dispatch(addToast({ type: "error", text: "Name is required" }));
      return;
    }

    const data = new FormData();
    data.append("name", values.name.trim());
    data.append("description", values.description?.trim() || "");
    data.append("status", String(Boolean(values.status)));
    if (values.image instanceof File) data.append("image", values.image);

    try {
      if (editingId) {
        await dispatch(updateParentCategory({ id: editingId, data })).unwrap();
      } else {
        await dispatch(createParentCategory(data)).unwrap();
      }
      dispatch(
        addToast({
          type: "success",
          text: `Parent category ${editingId ? "updated" : "created"}`,
        }),
      );
      setFormOpen(false);
      setEditingId(null);
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to save parent category",
        }),
      );
    }
  };

  const toggleStatus = async (category: ParentCategory) => {
    const data = new FormData();
    data.append("name", category.name);
    data.append("description", category.description || "");
    data.append("status", String(!(category.status ?? category.isActive)));

    try {
      await dispatch(updateParentCategory({ id: category._id, data })).unwrap();
      dispatch(
        addToast({
          type: "success",
          text: `${(category.status ?? category.isActive) ? "Deactivated" : "Activated"} parent category`,
        }),
      );
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          text:
            error instanceof Error ? error.message : "Unable to update status",
        }),
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteParentCategory(deleteId)).unwrap();
      dispatch(addToast({ type: "success", text: "Parent category deleted" }));
      setDeleteId(null);
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to delete parent category",
        }),
      );
    }
  };

  const columns: ColumnDef<ParentCategory>[] = [
    {
      key: "image",
      header: "Image",
      accessor: (category) => category.image || "",
      render: (value, category) =>
        value ? (
          <CustomImage
            src={String(value)}
            alt={category.name}
            className="h-11 w-14 rounded-md object-cover"
          />
        ) : (
          <div className="h-11 w-14 rounded-md bg-slate-100" />
        ),
    },
    {
      key: "name",
      header: "Parent Category",
      accessor: "name",
      sortable: true,
    },
    {
      key: "description",
      header: "Description",
      accessor: (category) => category.description || "",
    },
    {
      key: "status",
      header: "Status",
      accessor: (category) =>
        (category.status ?? category.isActive) ? "Active" : "Inactive",
    },
    {
      key: "actions",
      header: "Actions",
      accessor: "_id",
      align: "right",
      render: (_value, category) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            title={
              (category.status ?? category.isActive) ? "Deactivate" : "Activate"
            }
            aria-label={
              (category.status ?? category.isActive) ? "Deactivate" : "Activate"
            }
            onClick={() => void toggleStatus(category)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Power size={15} />
          </button>
          <DotMenu
            onEdit={() => {
              setEditingId(category._id);
              setFormOpen(true);
            }}
            onDelete={() => setDeleteId(category._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Parent Categories
          </h1>
          <p className="text-sm text-slate-500">
            Manage top-level product groups
          </p>
        </div>
        {!formOpen && (
          <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
            <Button
              onClick={() => {
                setEditingId(null);
                setFormOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus size={16} /> Add Parent Category
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportTableData(items, columns, "Parent Categories")
              }
              className="flex items-center gap-2"
            >
              <Download size={15} /> Export
            </Button>
          </div>
        )}
      </div>

      {formOpen ? (
        <ReusableForm
          title={`${editingId ? "Edit" : "Create"} Parent Category`}
          fields={fields}
          initialValues={initialValues}
          submitText={`${editingId ? "Update" : "Create"} Parent Category`}
          loading={isLoading}
          onSubmit={(values) => save(values as ParentCategoryFormValues)}
          onClose={() => {
            setFormOpen(false);
            setEditingId(null);
          }}
          resetKey={editingId ?? "new"}
        />
      ) : (
        <DataTable
          data={items}
          columns={columns}
          rowKey="_id"
          searchKeys={["name", "description"]}
          searchPlaceholder="Search parent categories..."
          defaultView="table"
          loading={isLoading}
          pageSize={10}
          paginationMode="client"
        />
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteId)}
        title="Delete this parent category? Related subcategories must be removed first."
        loading={isLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
