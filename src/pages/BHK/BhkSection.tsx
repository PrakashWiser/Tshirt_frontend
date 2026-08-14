import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Home } from "lucide-react";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import CreateBHK from "./CreateBhk";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import {
    clearBHKError,
    deleteBHK,
    getAllBHKs,
} from "../../store/slice/bhkSlice";
import type { BHK, BHKTableRow } from "../../store/slice/bhkSlice";
import DotMenu from "../../components/DotMenu";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { exportTableData } from "../../utils/exportToExcel";
import Button from "../../components/Button";

export default function BHKList() {
    const dispatch = useAppDispatch();
    const { message, error, bhks, isLoading } = useAppSelector(
        (state) => state.bhk
    );

    const [openCreate, setOpenCreate] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedBHK, setSelectedBHK] = useState<BHK | null>(null);

    useEffect(() => {
        dispatch(getAllBHKs());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllBHKs());
            setOpenCreate(false);
            dispatch(clearBHKError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearBHKError());
        }
    }, [message, error, dispatch]);

    const columns = useMemo<ColumnDef<BHKTableRow>[]>(
        () => [
            {
                key: "name",
                header: "BHK Name",
                accessor: "name",
                render: (value) => (
                    <div className="flex items-center gap-2">
                        <Home size={16} className="text-slate-400" />
                        <span className="font-medium text-slate-900">{String(value)}</span>
                    </div>
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
                render: (_value, row) => {
                    const bhk = bhks.find((b) => b._id === row.id);
                    const isActive = bhk?.status === "Active";

                    return (
                        <div className="flex items-center gap-2">
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
                accessor: "id",
                render: (_, row) => {
                    return (
                        <DotMenu
                            onEdit={() => {
                                const bhk = bhks.find((b) => b._id === row.id);
                                setSelectedBHK(bhk ?? null);
                                setOpenCreate(true);
                            }}
                            onDelete={() => handleDelete(row.id)}
                        />
                    );
                },
            },
        ],
        [bhks, dispatch]
    );

    const tableData: BHKTableRow[] = useMemo(() => {
        return bhks.map((bhk) => ({
            id: bhk._id,
            name: bhk.name,
            slug: bhk.slug,
            description: bhk.description,
            status: bhk.status,
            createdAt: bhk.createdAt,
        }));
    }, [bhks]);

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!deleteId) return;
        dispatch(deleteBHK(deleteId));
        setDeleteModal(false);
        setDeleteId(null);
    };

    const handleExport = () => {
        const exportColumns = columns.filter((col) => col.key !== "actions");
        exportTableData(tableData as any, exportColumns, "BHKs");
    };

    if (openCreate) {
        return (
            <CreateBHK
                bhk={selectedBHK}
                onClose={() => {
                    setOpenCreate(false);
                    setSelectedBHK(null);
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
                            BHK Management
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage BHK configurations and types.
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
                            New BHK
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Total BHKs</p>
                        <p className="text-2xl font-bold text-slate-900">{bhks.length}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Active</p>
                        <p className="text-2xl font-bold text-green-600">
                            {bhks.filter((b) => b.status === "Active").length}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Inactive</p>
                        <p className="text-2xl font-bold text-red-600">
                            {bhks.filter((b) => b.status === "Inactive").length}
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
                                searchKeys={["name", "slug", "description"]}
                                searchPlaceholder="Search BHKs..."
                            />
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this BHK?"
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