import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Search, X } from "lucide-react";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import PropertyTypeCreate from "./CreatePropertyType";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import {
    clearPropertyTypeError,
    deletePropertyType,
    getAllPropertyTypes,
    updatePropertyTypeStatus,
    type PropertyType,
    type PropertyTypeTableRow,
} from "../../store/slice/propertyTypeSlice";
import DotMenu from "../../components/DotMenu";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { exportTableData } from "../../utils/exportToExcel";
import Button from "../../components/Button";

export default function PropertyTypeList() {
    const dispatch = useAppDispatch();
    const { message, error, propertyTypes, isLoading } = useAppSelector(
        (state) => state.propertyType
    );

    const [openCreate, setOpenCreate] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(getAllPropertyTypes());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllPropertyTypes());
            setOpenCreate(false);
            dispatch(clearPropertyTypeError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearPropertyTypeError());
        }
    }, [message, error, dispatch]);

    const filteredPropertyTypes = useMemo(() => {
        if (!searchTerm.trim()) return propertyTypes;

        const searchLower = searchTerm.toLowerCase().trim();
        return propertyTypes.filter(
            (p) =>
                p.name.toLowerCase().includes(searchLower) ||
                p.slug.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower)
        );
    }, [propertyTypes, searchTerm]);

    const columns = useMemo<ColumnDef<PropertyTypeTableRow>[]>(
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
                key: "description",
                header: "Description",
                accessor: "description",
                render: (value) => (
                    <span className="text-sm text-slate-600">
                        {String(value) || "—"}
                    </span>
                ),
            },
            // {
            //     key: "icon",
            //     header: "Icon",
            //     accessor: "icon",
            //     render: (value) => (
            //         <span className="text-sm px-2 py-1 rounded-md bg-slate-50">
            //             {String(value) || "—"}
            //         </span>
            //     ),
            // },
            // {
            //     key: "sortOrder",
            //     header: "Sort Order",
            //     accessor: "sortOrder",
            //     render: (value) => (
            //         <span className="text-sm font-mono">{String(value)}</span>
            //     ),
            // },
            {
                key: "status",
                header: "Status",
                accessor: "status",
                render: (_value, row) => {
                    const propertyType = propertyTypes.find((p) => p._id === row.id);
                    const isActive = propertyType?.status === "Active";

                    return (
                        <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isActive}
                                    onChange={() => {
                                        if (!propertyType) return;
                                        const newStatus = propertyType.status === "Active" ? "Inactive" : "Active";
                                        dispatch(
                                            updatePropertyTypeStatus({
                                                id: propertyType._id,
                                                status: newStatus,
                                            })
                                        );
                                    }}
                                />
                                {/* <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors">
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isActive ? "translate-x-5" : ""
                                            }`}
                                    />
                                </div> */}
                            </label>
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
                                const propertyType = propertyTypes.find((p) => p._id === row.id);
                                setSelectedPropertyType(propertyType ?? null);
                                setOpenCreate(true);
                            }}
                            onDelete={() => handleDelete(row.id)}
                        />
                    );
                },
            },
        ],
        [propertyTypes, dispatch,]
    );

    const tableData: PropertyTypeTableRow[] = useMemo(() => {
        return filteredPropertyTypes.map((propertyType) => ({
            id: propertyType._id,
            name: propertyType.name,
            slug: propertyType.slug,
            description: propertyType.description,
            icon: propertyType.icon,
            sortOrder: propertyType.sortOrder,
            status: propertyType.status,
            createdAt: propertyType.createdAt,
        }));
    }, [filteredPropertyTypes]);

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!deleteId) return;
        dispatch(deletePropertyType(deleteId));
        setDeleteModal(false);
        setDeleteId(null);
    };

    const handleExport = () => {
        const exportColumns = columns.filter(col => col.key !== 'actions');
        exportTableData(tableData as any, exportColumns, "PropertyTypes");
    };

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    if (openCreate) {
        return (
            <PropertyTypeCreate
                propertyType={selectedPropertyType}
                onClose={() => {
                    setOpenCreate(false);
                    setSelectedPropertyType(null);
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
                            Property Types
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage property types and categories for your listings.
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
                            className="flex cursor-pointer items-center gap-2 px-4 py-2  text-white rounded-md transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                        >
                            <Plus size={18} />
                            New Property Type
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Total Property Types</p>
                        <p className="text-2xl font-bold text-slate-900">{propertyTypes.length}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Active</p>
                        <p className="text-2xl font-bold text-green-600">
                            {propertyTypes.filter(p => p.status === "Active").length}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Inactive</p>
                        <p className="text-2xl font-bold text-red-600">
                            {propertyTypes.filter(p => p.status === "Inactive").length}
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-slate-100 gap-3">
                        <h3 className="font-semibold text-slate-900">All Property Types</h3>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search property types..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            {searchTerm && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

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
                                searchPlaceholder="Search property types..."
                            />
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this property type?"
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