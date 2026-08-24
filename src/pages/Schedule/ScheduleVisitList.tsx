import { useEffect, useMemo, useState } from "react";
import {
    Download,
    Calendar,
    Clock,
    User,
    Phone,
    Home,
    Video,
    Users,
} from "lucide-react";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import {
    clearScheduleVisitError,
    deleteScheduleVisit,
    getAllScheduleVisits,
    updateScheduleVisitStatus,
    getStatusColor,
    getStatusBadge,
    getViewingTypeColor,
    type ScheduleVisitTableRow,
    type ScheduleVisitStatus,
} from "../../store/slice/scheduleVisitSlice";
import DotMenu from "../../components/DotMenu";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { exportTableData } from "../../utils/exportToExcel";

const STATUS_OPTIONS: {
    value: ScheduleVisitStatus;
    label: string;
}[] = [
        { value: "Active", label: "Active" },
        { value: "Completed", label: "Completed" },
        { value: "Deleted", label: "Deleted" },
    ];

export default function ScheduleVisitList() {
    const dispatch = useAppDispatch();

    const {
        message,
        error,
        scheduleVisits,
        isLoading,
        pagination,
    } = useAppSelector((state) => state.scheduleVisit);

    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(
            getAllScheduleVisits({
                page: currentPage,
                limit,
                status:
                    (statusFilter as ScheduleVisitStatus) || undefined,
                search: search.trim() || undefined,
            })
        );
    }, [
        dispatch,
        currentPage,
        limit,
        statusFilter,
        search,
    ]);

    useEffect(() => {
        if (message) {
            dispatch(
                addToast({
                    type: "success",
                    text: message,
                })
            );

            dispatch(
                getAllScheduleVisits({
                    page: currentPage,
                    limit,
                    status:
                        (statusFilter as ScheduleVisitStatus) ||
                        undefined,
                    search: search.trim() || undefined,
                })
            );

            dispatch(clearScheduleVisitError());
        }

        if (error) {
            dispatch(
                addToast({
                    type: "error",
                    text: error,
                })
            );

            dispatch(clearScheduleVisitError());
        }
    }, [
        message,
        error,
        dispatch,
        currentPage,
        limit,
        statusFilter,
        search,
    ]);

    const handleStatusChange = (
        id: string,
        newStatus: string
    ) => {
        dispatch(
            updateScheduleVisitStatus({
                id,
                status: newStatus as ScheduleVisitStatus,
            })
        );
    };

    const columns = useMemo<
        ColumnDef<ScheduleVisitTableRow>[]
    >(
        () => [
            {
                key: "propertyName",
                header: "Property",
                accessor: "propertyName",
                render: (value) => (
                    <div className="flex items-center gap-2">
                        <Home
                            size={16}
                            className="text-slate-400"
                        />
                        <span className="font-medium text-slate-900">
                            {String(value)}
                        </span>
                    </div>
                ),
            },
            {
                key: "fullName",
                header: "Visitor",
                accessor: "fullName",
                render: (value, row) => (
                    <div>
                        <div className="flex items-center gap-2">
                            <User
                                size={14}
                                className="text-slate-400"
                            />
                            <span className="font-medium text-slate-900">
                                {String(value)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <Phone
                                size={12}
                                className="text-slate-400"
                            />
                            <span>{row.phone}</span>
                        </div>

                        <div className="text-xs text-slate-400 mt-0.5">
                            {row.email}
                        </div>
                    </div>
                ),
            },
            {
                key: "date",
                header: "Visit Date & Time",
                accessor: "date",
                render: (value, row) => (
                    <div>
                        <div className="flex items-center gap-2">
                            <Calendar
                                size={14}
                                className="text-slate-400"
                            />
                            <span className="text-sm">
                                {new Date(
                                    String(value)
                                ).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-0.5">
                            <Clock
                                size={14}
                                className="text-slate-400"
                            />
                            <span>{row.time}</span>
                        </div>
                    </div>
                ),
            },
            {
                key: "viewingType",
                header: "Viewing Type",
                accessor: "viewingType",
                render: (value) => {
                    const type = String(value);
                    const Icon =
                        type === "In Person" ? Users : Video;

                    return (
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getViewingTypeColor(
                                type
                            )}`}
                        >
                            <Icon size={12} />
                            {type}
                        </span>
                    );
                },
            },
            {
                key: "status",
                header: "Status",
                accessor: "status",
                render: (value, row) => {
                    const status = String(value);

                    return (
                        <div className="flex items-center gap-2">
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    status
                                )}`}
                            >
                                {getStatusBadge(status)}
                            </span>

                            <select
                                value={status}
                                onChange={(e) =>
                                    handleStatusChange(
                                        row.id,
                                        e.target.value
                                    )
                                }
                                className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={(e) =>
                                    e.stopPropagation()
                                }
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                },
            },
            {
                key: "specialRequest",
                header: "Special Request",
                accessor: "specialRequest",
                render: (value) => (
                    <span className="text-sm text-slate-600">
                        {String(value) || "—"}
                    </span>
                ),
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
                render: (_, row) => (
                    <DotMenu
                        onDelete={() => handleDelete(row.id)}
                    />
                ),
            },
        ],
        [scheduleVisits]
    );

    const tableData: ScheduleVisitTableRow[] = useMemo(
        () =>
            scheduleVisits.map((sv) => ({
                id: sv._id,
                propertyName:
                    typeof sv.propertyId === "object"
                        ? sv.propertyId.name
                        : "Unknown",
                propertyId:
                    typeof sv.propertyId === "object"
                        ? sv.propertyId._id
                        : sv.propertyId || "",
                fullName: sv.fullName,
                email: sv.email,
                phone: sv.phone,
                date: sv.date,
                time: sv.time,
                viewingType: sv.viewingType,
                status: sv.status,
                specialRequest: sv.specialRequest || "",
                createdAt: sv.createdAt,
            })),
        [scheduleVisits]
    );

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!deleteId) return;

        dispatch(deleteScheduleVisit(deleteId));
        setDeleteModal(false);
        setDeleteId(null);
    };

    const handleExport = () => {
        const exportColumns = columns.filter(
            (col) => col.key !== "actions"
        );

        exportTableData(
            tableData as any,
            exportColumns,
            "ScheduleVisits"
        );
    };

    return (
        <>
            <div className="space-y-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            Schedule Visits
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            Manage property visit schedules and appointments.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Status</option>

                                {STATUS_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
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
                        <p className="text-sm text-slate-500">
                            Total Visits
                        </p>

                        <p className="text-2xl font-bold text-slate-900">
                            {pagination?.total ||
                                scheduleVisits.length}
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">
                            Active
                        </p>

                        <p className="text-2xl font-bold text-green-600">
                            {
                                scheduleVisits.filter(
                                    (sv) =>
                                        sv.status === "Active"
                                ).length
                            }
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">
                            Completed
                        </p>

                        <p className="text-2xl font-bold text-blue-600">
                            {
                                scheduleVisits.filter(
                                    (sv) =>
                                        sv.status === "Completed"
                                ).length
                            }
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="p-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
                            </div>
                        ) : (
                            <DataTable
                                data={tableData}
                                columns={columns}
                                rowKey="id"
                                defaultView="table"
                                searchKeys={[
                                    "propertyName",
                                    "fullName",
                                    "email",
                                    "phone",
                                ]}
                                searchPlaceholder="Search schedule visits..."
                                paginationMode="server"
                                loading={isLoading}
                                onSearchChange={(value) => {
                                    setSearch(value);
                                    setCurrentPage(1);
                                }}
                                pagination={{
                                    currentPage:
                                        pagination?.page || 1,
                                    totalPages:
                                        pagination?.totalPages || 1,
                                    total:
                                        pagination?.total || 0,
                                    limit:
                                        pagination?.limit || 10,
                                    onPageChange: (page) => {
                                        setCurrentPage(page);
                                    },
                                    onLimitChange: (newLimit) => {
                                        setLimit(newLimit);
                                        setCurrentPage(1);
                                    },
                                    pageSizeOptions: [
                                        10,
                                        20,
                                        50,
                                        100,
                                    ],
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this schedule visit?"
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