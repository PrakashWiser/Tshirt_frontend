import { useEffect, useMemo, useState } from "react";
import { Download, Plus, BadgeCheck, BadgePlus } from "lucide-react";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import PropertyActionCreate from "./CreatePropertyAction";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import {
    clearPropertyActionError,
    deletePropertyAction,
    getAllPropertyActions,
    type PropertyAction,
    type PropertyActionTableRow,
} from "../../store/slice/propertyActionSlice";
import DotMenu from "../../components/DotMenu";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { exportTableData } from "../../utils/exportToExcel";
import Button from "../../components/Button";
import CustomImage from "../../components/Image";

export default function PropertyActionList() {
    const dispatch = useAppDispatch();
    const { message, error, propertyActions, isLoading } = useAppSelector(
        (state) => state.propertyAction
    );

    const [openCreate, setOpenCreate] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedPropertyAction, setSelectedPropertyAction] = useState<PropertyAction | null>(null);

    useEffect(() => {
        dispatch(getAllPropertyActions());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllPropertyActions());
            setOpenCreate(false);
            dispatch(clearPropertyActionError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearPropertyActionError());
        }
    }, [message, error, dispatch]);

    const columns = useMemo<ColumnDef<PropertyActionTableRow>[]>(
        () => [
            {
                key: "name",
                header: "Name",
                accessor: "name",
                render: (value) => (
                    <span className="font-medium text-slate-900">{String(value)}</span>
                ),
            },
            {
                key: "slug",
                header: "Slug",
                accessor: "slug",
                render: (value) => (
                    <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded-md">
                        {String(value)}
                    </span>
                ),
            },
            {
                key: "isNew",
                header: "Status",
                accessor: "isNew",
                render: (value, _row) => {
                    const isNew = Boolean(value);
                    return (
                        <div className="flex items-center gap-2">
                            {isNew ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    <BadgePlus size={14} />
                                    New
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                    <BadgeCheck size={14} />
                                    Existing
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                key: "status",
                header: "Active Status",
                accessor: "status",
                render: (_value, row) => {
                    const propertyAction = propertyActions.find((p) => p._id === row.id);
                    const isActive = propertyAction?.status === "Active";

                    return (
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                                }`}>
                                {isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    );
                },
            },
            {
                key: "image",
                header: "Image",
                accessor: "image",
                render: (value) => {
                    const image = String(value || "");

                    return (
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                            {image ? (
                                <CustomImage
                                    src={image}
                                    alt="Property Action"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                                    No Image
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                key: "updatedAt",
                header: "Last Updated",
                accessor: "updatedAt",
                render: (value) => {
                    const date = new Date(String(value));
                    return date.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                },
            },
            {
                key: "actions",
                header: "Actions",
                accessor: "id",
                render: (_, row) => {
                    return (
                        <DotMenu
                            onEdit={() => {
                                const propertyAction = propertyActions.find((p) => p._id === row.id);
                                setSelectedPropertyAction(propertyAction ?? null);
                                setOpenCreate(true);
                            }}
                            onDelete={() => handleDelete(row.id)}
                        />
                    );
                },
            },
        ],
        [propertyActions, dispatch,]
    );

    const tableData: PropertyActionTableRow[] = useMemo(() => {
        return propertyActions.map((propertyAction) => ({
            id: propertyAction._id,
            name: propertyAction.name,
            slug: propertyAction.slug,
            isNew: propertyAction.isNew,
            status: propertyAction.status,
            image: propertyAction.image,
            updatedAt: propertyAction.updatedAt || propertyAction.createdAt || new Date().toISOString(),
        }));
    }, [propertyActions]);

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!deleteId) return;
        dispatch(deletePropertyAction(deleteId));
        setDeleteModal(false);
        setDeleteId(null);
    };

    const handleExport = () => {
        const exportColumns = columns.filter(col => col.key !== 'actions');
        exportTableData(tableData as any, exportColumns, "PropertyActions");
    };

    if (openCreate) {
        return (
            <PropertyActionCreate
                propertyAction={selectedPropertyAction}
                onClose={() => {
                    setOpenCreate(false);
                    setSelectedPropertyAction(null);
                }}
            />
        );
    }

    return (
        <>
            <div className="space-y-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            Property Actions
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage property actions like Buy, Rent, Plots, Commercial, etc.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium"
                            disabled={tableData.length === 0}
                        >
                            <Download size={18} />
                            Export
                        </button>
                        <Button
                            onClick={() => setOpenCreate(true)}
                            className="flex cursor-pointer items-center gap-2 px-4 py-2 text-white rounded-md transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                        >
                            <Plus size={18} />
                            New Action
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Total Actions</p>
                        <p className="text-2xl font-bold text-slate-900">{propertyActions.length}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Active</p>
                        <p className="text-2xl font-bold text-green-600">
                            {propertyActions.filter(p => p.status === "Active").length}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Inactive</p>
                        <p className="text-2xl font-bold text-red-600">
                            {propertyActions.filter(p => p.status === "Inactive").length}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">New Actions</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {propertyActions.filter(p => p.isNew).length}
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="p-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                            </div>
                        ) : (
                            <DataTable
                                data={tableData}
                                columns={columns}
                                rowKey="id"
                                defaultView="table"
                                searchKeys={["name", "slug"]}
                                searchPlaceholder="Search property actions..."
                            />
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this property action?"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setDeleteModal(false);
                    setDeleteId(null);
                }}
                loading={isLoading}
            />
        </>
    );
}