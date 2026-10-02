import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Power } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import Button from "../../components/Button";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import DotMenu from "../../components/DotMenu";
import ReusableForm, { type FormField } from "../../components/ReusableForm";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import { exportTableData } from "../../utils/exportToExcel";
import { getCategoryId } from "../../utils/categoryHierarchy";
import type { SubCategory } from "../../types/category";
import { getParentCategories } from "../../store/slice/parentCategorySlice";
import {
  createSubCategory,
  deleteSubCategory,
  getSubCategories,
  updateSubCategory,
} from "../../store/slice/subCategorySlice";

interface SubCategoryFormValues {
  name?: string;
  description?: string;
  parentCategoryId?: string;
  status?: boolean;
}

export default function SubCategoryPage() {
  const dispatch = useAppDispatch();
  const parents = useAppSelector((state) => state.parentCategories);
  const subCategories = useAppSelector((state) => state.subCategories);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const editingSubcategory =
    subCategories.items.find((item) => item._id === editingId) || null;
  const selectedParent =
    editingSubcategory?.parentCategory &&
    typeof editingSubcategory.parentCategory !== "string"
      ? editingSubcategory.parentCategory
      : null;

  const parentOptions = useMemo(
    () =>
      parents.items
        .filter((parent) => parent.isActive || parent._id === selectedParent?._id)
        .map((parent) => ({
          label: `${parent.name}${parent.isActive ? "" : " (Inactive)"}`,
          value: parent._id,
        })),
    [parents.items, selectedParent?._id],
  );

  const fields: FormField[] = [
    {
      name: "name",
      label: "Sub Category Name",
      type: "text",
      placeholder: "Summer Collection",
      required: true,
      fullWidth: true,
    },
    {
      name: "parentCategoryId",
      label: "Parent Category",
      type: "select",
      required: true,
      options: parentOptions,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      fullWidth: true,
    },
    { name: "status", label: "Active", type: "checkbox", fullWidth: true },
  ];

  const initialValues = useMemo(
    () => ({
      name: editingSubcategory?.name || "",
      parentCategoryId: editingSubcategory
        ? editingSubcategory.parentCategoryId ||
          getCategoryId(editingSubcategory.parentCategory)
        : "",
      description: editingSubcategory?.description || "",
      status:
        editingSubcategory?.status ?? editingSubcategory?.isActive ?? true,
    }),
    [editingSubcategory],
  );

  useEffect(() => {
    dispatch(getParentCategories(true))
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
    dispatch(getSubCategories())
      .unwrap()
      .catch((error: unknown) => {
        dispatch(
          addToast({
            type: "error",
            text:
              error instanceof Error
                ? error.message
                : "Failed to load subcategories",
          }),
        );
      });
  }, [dispatch]);

  const save = async (values: SubCategoryFormValues) => {
    if (!values.name?.trim()) {
      dispatch(addToast({ type: "error", text: "Name is required" }));
      return;
    }
    if (!values.parentCategoryId) {
      dispatch(
        addToast({ type: "error", text: "Select a parent category" }),
      );
      return;
    }

    const data = new FormData();
    data.append("name", values.name.trim());
    data.append("description", values.description?.trim() || "");
    data.append("parentCategoryId", values.parentCategoryId);
    data.append("status", String(Boolean(values.status)));

    try {
      if (editingId) {
        await dispatch(updateSubCategory({ id: editingId, data })).unwrap();
      } else {
        await dispatch(createSubCategory(data)).unwrap();
      }
      dispatch(
        addToast({
          type: "success",
          text: `Subcategory ${editingId ? "updated" : "created"}`,
        }),
      );
      setFormOpen(false);
      setEditingId(null);
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          text: error instanceof Error ? error.message : "Unable to save subcategory",
        }),
      );
    }
  };

  const getParentName = (subcategory: SubCategory) => {
    if (
      subcategory.parentCategory &&
      typeof subcategory.parentCategory !== "string"
    ) {
      return subcategory.parentCategory.name;
    }
    const parentId =
      subcategory.parentCategoryId || getCategoryId(subcategory.parentCategory);
    return parents.items.find((parent) => parent._id === parentId)?.name || "Parent unavailable";
  };

  const toggleStatus = async (subcategory: SubCategory) => {
    const data = new FormData();
    data.append("name", subcategory.name);
    data.append("description", subcategory.description || "");
    data.append(
      "parentCategoryId",
      subcategory.parentCategoryId || getCategoryId(subcategory.parentCategory),
    );
    data.append(
      "status",
      String(!(subcategory.status ?? subcategory.isActive)),
    );

    try {
      await dispatch(updateSubCategory({ id: subcategory._id, data })).unwrap();
      dispatch(
        addToast({
          type: "success",
          text: `${subcategory.status ?? subcategory.isActive ? "Deactivated" : "Activated"} subcategory`,
        }),
      );
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          text: error instanceof Error ? error.message : "Unable to update status",
        }),
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteSubCategory(deleteId)).unwrap();
      dispatch(addToast({ type: "success", text: "Subcategory deleted" }));
      setDeleteId(null);
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          text: error instanceof Error ? error.message : "Unable to delete subcategory",
        }),
      );
    }
  };

  const columns: ColumnDef<SubCategory>[] = [
      {
        key: "name",
        header: "Sub Category",
        accessor: "name",
        sortable: true,
      },
      {
        key: "parentCategory",
        header: "Parent Category",
        accessor: (subcategory) => getParentName(subcategory),
        sortable: true,
      },
      {
        key: "description",
        header: "Description",
        accessor: (subcategory) => subcategory.description || "",
      },
      {
        key: "status",
        header: "Status",
        accessor: (subcategory) =>
          subcategory.status ?? subcategory.isActive ? "Active" : "Inactive",
      },
      {
        key: "actions",
        header: "Actions",
        accessor: "_id",
        align: "right",
        render: (_value, subcategory) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              title={subcategory.status ?? subcategory.isActive ? "Deactivate" : "Activate"}
              aria-label={subcategory.status ?? subcategory.isActive ? "Deactivate" : "Activate"}
              onClick={() => void toggleStatus(subcategory)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Power size={15} />
            </button>
            <DotMenu
              onEdit={() => {
                setEditingId(subcategory._id);
                setFormOpen(true);
              }}
              onDelete={() => setDeleteId(subcategory._id)}
            />
          </div>
        ),
      },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Sub Categories</h1>
          <p className="text-sm text-slate-500">Manage subcategories under each parent</p>
        </div>
        {!formOpen && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => exportTableData(subCategories.items, columns, "Sub Categories")}
            >
              <Download size={15} /> Export
            </Button>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus size={16} /> Add Sub Category
            </Button>
          </div>
        )}
      </div>

      {formOpen ? (
        <ReusableForm
          title={`${editingId ? "Edit" : "Create"} Sub Category`}
          fields={fields}
          initialValues={initialValues}
          submitText={`${editingId ? "Update" : "Create"} Sub Category`}
          loading={parents.isLoading || subCategories.isLoading}
          onSubmit={(values) => save(values as SubCategoryFormValues)}
          onClose={() => {
            setFormOpen(false);
            setEditingId(null);
          }}
          resetKey={editingId ?? "new"}
        />
      ) : (
        <DataTable
          data={subCategories.items}
          columns={columns}
          rowKey="_id"
          searchKeys={["name", "description"]}
          searchPlaceholder="Search subcategories..."
          defaultView="table"
          loading={parents.isLoading || subCategories.isLoading}
          pageSize={10}
          paginationMode="client"
        />
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteId)}
        title="Delete this subcategory? Product categories must be removed first."
        loading={subCategories.isLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
