import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Image as ImageIcon } from "lucide-react";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import DotMenu from "../../components/DotMenu";
import Button from "../../components/Button";
import CreateLifestyle from "./CreateLifestyle";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import {
    clearLifestyleError,
    deleteLifestyle,
    getAllLifestyles,
    updateLifestyleStatus,
} from "../../store/slice/lifestyleSlice";
import type { Lifestyle } from "../../store/slice/lifestyleSlice";
import CustomImage from "../../components/Image";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { exportTableData } from "../../utils/exportToExcel";

export default function LifestyleList() {
    const dispatch = useAppDispatch();
    const [openForm, setOpenForm] = useState(false);
    const [selectedLifestyle, setSelectedLifestyle] = useState<Lifestyle | null>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const {
        message,
        error,
        lifestyles: datas,
        isLoading,
    } = useAppSelector((state) => state.lifestyle);

    useEffect(() => {
        dispatch(getAllLifestyles());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllLifestyles());
            setSelectedLifestyle(null);
            setOpenForm(false);
            dispatch(clearLifestyleError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearLifestyleError());
        }
    }, [message, error, dispatch]);

    const columns = useMemo<ColumnDef<Lifestyle>[]>(
        () => [
            {
                key: "image",
                header: "Image",
                accessor: "image",
                render: (value, row) => {
                    return value ? (
                        <CustomImage
                            src={String(value)}
                            alt={row.name}
                            className="h-12 w-12 object-cover rounded-lg border border-slate-200"
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
                            <ImageIcon size={20} className="text-slate-400" />
                        </div>
                    );
                },
            },
            {
                key: "name",
                header: "Lifestyle Name",
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
                key: "description",
                header: "Description",
                accessor: "description",
                render: (value) => (
                    <span className="text-sm text-slate-600">
                        {String(value) || "—"}
                    </span>
                ),
            },
            {
                key: "status",
                header: "Status",
                accessor: "status",
                render: (value, row) => {
                    const isActive = value === "Active";
                    return (
                        <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isActive}
                                    onChange={() => {
                                        const newStatus = isActive ? "Inactive" : "Active";
                                        dispatch(
                                            updateLifestyleStatus({
                                                id: row._id,
                                                status: newStatus,
                                            })
                                        );
                                    }}
                                />
                                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors">
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isActive ? "translate-x-5" : ""
                                            }`}
                                    />
                                </div>
                            </label>
                            <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    );
                },
            },
            {
                key: "createdAt",
                header: "Created At",
                accessor: "createdAt",
                render: (value) => {
                    const date = new Date(String(value));
                    return date.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    });
                },
            },
            {
                key: "actions",
                header: "Actions",
                accessor: "_id",
                render: (_, row) => {
                    return (
                        <DotMenu
                            onEdit={() => handleEdit(row)}
                            onDelete={() => handleDelete(row._id)}
                        />
                    );
                },
            },
        ],
        [dispatch]
    );

    const handleAddLifestyle = () => {
        setSelectedLifestyle(null);
        setOpenForm(true);
    };

    const handleEdit = (lifestyle: Lifestyle) => {
        setSelectedLifestyle(lifestyle);
        setOpenForm(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const handleExport = () => {
        exportTableData(
            datas as Lifestyle[],
            columns,
            "Lifestyles"
        );
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await dispatch(deleteLifestyle(deleteId));
            setDeleteModal(false);
            setDeleteId(null);
        } catch (error) {
            console.error(error);
        }
    };

    if (openForm) {
        return (
            <CreateLifestyle
                selectedLifestyle={selectedLifestyle}
                onClose={() => {
                    setSelectedLifestyle(null);
                    setOpenForm(false);
                }}
            />
        );
    }

    return (
        <>
            <DataTable<Lifestyle>
                data={(datas as Lifestyle[]) || []}
                columns={columns}
                rowKey="_id"
                defaultView="grid"
                pageSize={9}
                searchKeys={["name", "slug", "description"]}
                searchPlaceholder="Search lifestyles..."
                loading={isLoading}
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 h-9 rounded-lg border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
                        >
                            <Download size={16} />
                            Export
                        </Button>
                        <Button
                            className="flex items-center gap-2 px-4 h-9 rounded-lg  text-white text-xs font-medium"
                            onClick={handleAddLifestyle}
                        >
                            <Plus size={16} />
                            Add Lifestyle
                        </Button>
                    </div>
                }
                gridClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
                renderGridCard={(lifestyle) => (
                    <div key={lifestyle?._id} className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="relative h-40 bg-slate-50 flex items-center justify-center">
                            {lifestyle.image ? (
                                <CustomImage
                                    src={lifestyle.image}
                                    alt={lifestyle.name}
                                    className="h-full w-full object-cover transition-all duration-500 ease-in-out"
                                />
                            ) : (
                                <ImageIcon size={48} className="text-slate-300" />
                            )}
                            <span
                                className={`absolute left-3 top-3 px-2 py-1 rounded-full text-xs font-medium ${lifestyle.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {lifestyle.status}
                            </span>
                            <div className="absolute right-3 top-3">
                                <DotMenu
                                    onEdit={() => handleEdit(lifestyle)}
                                    onDelete={() => handleDelete(lifestyle._id)}
                                />
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-slate-900 text-lg capitalize">
                                {lifestyle.name}
                            </h3>
                            {lifestyle.description && (
                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                    {lifestyle.description}
                                </p>
                            )}
                            <p className="text-sm text-slate-400 mt-1">
                                slug: {lifestyle.slug}
                            </p>
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-400">
                                    Created: {new Date(lifestyle.createdAt).toLocaleDateString()}
                                </span>
                                {lifestyle.status === "Active" && (
                                    <span className="text-xs text-green-600 font-medium">● Active</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            />

            <ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this lifestyle?"
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