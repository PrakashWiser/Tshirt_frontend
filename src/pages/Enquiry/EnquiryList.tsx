import { useEffect, useMemo, useState } from "react";
import { Download, Phone, User, Home } from "lucide-react";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import {
    clearEnquiryError,
    deleteEnquiry,
    getAllEnquiries,
    updateEnquiryStatus,
    getStatusColor,
    getStatusBadge,
    getStatusOptions,
    type EnquiryTableRow,
    type EnquiryStatus,
} from "../../store/slice/enquirySlice";
import DotMenu from "../../components/DotMenu";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { exportTableData } from "../../utils/exportToExcel";

const STATUS_OPTIONS = getStatusOptions();

export default function EnquiryList() {
    const dispatch = useAppDispatch();
    const { message, error, enquiries, isLoading, pagination } = useAppSelector(
        (state) => state.enquiry
    );

    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>("");

    useEffect(() => {
        dispatch(getAllEnquiries({
            page: currentPage,
            limit,
            status: statusFilter as EnquiryStatus || undefined
        }));
    }, [dispatch, currentPage, limit, statusFilter]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllEnquiries({ page: currentPage, limit }));
            dispatch(clearEnquiryError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearEnquiryError());
        }
    }, [message, error, dispatch, currentPage, limit]);

    const handleStatusChange = (id: string, newStatus: string) => {
        dispatch(updateEnquiryStatus({ id, status: newStatus as EnquiryStatus }));
    };

    const columns = useMemo<ColumnDef<EnquiryTableRow>[]>(
        () => [
            {
                key: "fullName",
                header: "Full Name",
                accessor: "fullName",
                render: (value) => (
                    <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        <span className="font-medium text-slate-900">{String(value)}</span>
                    </div>
                ),
            },
            {
                key: "phone",
                header: "Phone Number",
                accessor: "phone",
                render: (value) => (
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        <span className="font-mono text-sm">{String(value)}</span>
                    </div>
                ),
            },
            {
                key: "propertyName",
                header: "Property",
                accessor: "propertyName",
                render: (value, _row) => (
                    <div className="flex items-center gap-2">
                        <Home size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-700">{String(value)}</span>
                    </div>
                ),
            },
            {
                key: "status",
                header: "Status",
                accessor: "status",
                render: (value, row) => {
                    const status = String(value);
                    return (
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                {getStatusBadge(status)}
                            </span>
                            <select
                                value={status}
                                onChange={(e) => handleStatusChange(row.id, e.target.value)}
                                className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
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
                            onDelete={() => handleDelete(row.id)}
                        />
                    );
                },
            },
        ],
        [enquiries]
    );

    const tableData: EnquiryTableRow[] = useMemo(() => {
        return enquiries.map((enquiry) => ({
            id: enquiry._id,
            fullName: enquiry.fullName,
            phone: enquiry.phone,
            propertyName: typeof enquiry.propertyId === "object"
                ? enquiry.propertyId.name
                : "Unknown",
            propertyId: typeof enquiry.propertyId === "object"
                ? enquiry.propertyId._id
                : enquiry.propertyId || "",
            status: enquiry.status,
            createdAt: enquiry.createdAt,
        }));
    }, [enquiries]);

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!deleteId) return;
        dispatch(deleteEnquiry(deleteId));
        setDeleteModal(false);
        setDeleteId(null);
    };

    const handleExport = () => {
        const exportColumns = columns.filter((col) => col.key !== "actions");
        exportTableData(tableData as any, exportColumns, "Enquiries");
    };

    return (
        <>
            <div className="space-y-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            Enquiry Management
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage all property enquiries and customer inquiries.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Status</option>
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium"
                            disabled={tableData.length === 0}
                        >
                            <Download size={18} />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Total Enquiries</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {pagination?.total || enquiries.length}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Active</p>
                        <p className="text-2xl font-bold text-green-600">
                            {enquiries.filter((e) => e.status === "Active").length}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Attended</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {enquiries.filter((e) => e.status === "Attended").length}
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
                                searchKeys={["fullName", "phone", "propertyName"]}
                                searchPlaceholder="Search enquiries..."
                                paginationMode="server"
                                pagination={{
                                    currentPage: pagination?.page || 1,
                                    totalPages: pagination?.totalPages || 1,
                                    total: pagination?.total || 0,
                                    limit: pagination?.limit || 10,
                                    onPageChange: (page) => {
                                        setCurrentPage(page);
                                    },
                                    onLimitChange: (limit) => {
                                        setLimit(limit);
                                        setCurrentPage(1);
                                    },
                                    pageSizeOptions: [10, 20, 50, 100],
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this enquiry?"
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