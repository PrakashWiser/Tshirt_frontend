import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Info,
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    Download,
} from "lucide-react";

import { setBreadcrumbs } from "../../store/slice/uiSlice";
import {
    useAppDispatch,
    useAppSelector,
} from "../../hooks/hooks";
import { getNotifications } from "../../store/slice/getNotificationSlice";

const severityColors = {
    INFO:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/30",

    WARNING:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/30",

    CRITICAL:
        "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30",

    SUCCESS:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30",
};

const severityIcons = {
    INFO: Info,
    WARNING: AlertTriangle,
    CRITICAL: AlertCircle,
    SUCCESS: CheckCircle,
};

export default function AuditLogs() {
    const dispatch = useAppDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSeverity, setSelectedSeverity] =
        useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const pageLimit = 10;



    const {
        notifications,
        pagination,
        isLoading,
        error,
    } = useAppSelector(
        (state) => state.getNotifications
    );


    useEffect(() => {
        dispatch(
            getNotifications({
                page: currentPage,
                limit: pageLimit,
            })
        );
    }, [dispatch, currentPage]);


    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                {
                    label: "System",
                    path: "/system",
                },
                {
                    label: "Audit Logs",
                },
            ])
        );
    }, [dispatch]);


    const filteredNotifications = useMemo(() => {
        const search =
            searchTerm.trim().toLowerCase();

        return notifications.filter(
            (notification) => {
                const matchesSearch =
                    !search ||
                    notification.message
                        ?.toLowerCase()
                        .includes(search) ||
                    notification.fullName
                        ?.toLowerCase()
                        .includes(search) ||
                    notification.email
                        ?.toLowerCase()
                        .includes(search) ||
                    notification.phone
                        ?.toLowerCase()
                        .includes(search) ||
                    notification.category
                        ?.toLowerCase()
                        .includes(search) ||
                    notification.propertyId
                        ?.toLowerCase()
                        .includes(search);

                const severity =
                    notification.severity || "INFO";

                const matchesSeverity =
                    selectedSeverity === "All" ||
                    severity === selectedSeverity;

                return (
                    matchesSearch &&
                    matchesSeverity
                );
            }
        );
    }, [
        notifications,
        searchTerm,
        selectedSeverity,
    ]);


    const severityCounts = useMemo(() => {
        return notifications.reduce(
            (acc, notification) => {
                const severity =
                    notification.severity ||
                    "INFO";

                acc[severity] =
                    (acc[severity] || 0) + 1;

                return acc;
            },
            {} as Record<string, number>
        );
    }, [notifications]);


    const totalPages =
        pagination?.totalPages || 1;

    const totalRecords =
        pagination?.total || 0;

    const startRecord =
        totalRecords === 0
            ? 0
            : (currentPage - 1) *
            pageLimit +
            1;

    const endRecord =
        Math.min(
            currentPage * pageLimit,
            totalRecords
        );


    const handlePrevious = () => {
        if (currentPage > 1 && !isLoading) {
            setCurrentPage(
                (prev) => prev - 1
            );
        }
    };



    const handleNext = () => {
        if (
            currentPage < totalPages &&
            !isLoading
        ) {
            setCurrentPage(
                (prev) => prev + 1
            );
        }
    };

    const handlePageChange = (
        page: number
    ) => {
        if (
            page !== currentPage &&
            !isLoading
        ) {
            setCurrentPage(page);
        }
    };



    return (
        <div
            className="space-y-6"
            id="audit-logs-page"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Audit Logs
                    </h1>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        System activity monitoring
                        and security audit trail
                    </p>
                </div>

                <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <Download className="w-4 h-4" />

                    Export Logs
                </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {[
                        "All",
                        "INFO",
                        "WARNING",
                        "CRITICAL",
                    ].map((severity) => (
                        <button
                            key={severity}
                            type="button"
                            onClick={() =>
                                setSelectedSeverity(
                                    severity
                                )
                            }
                            className={`px-3 py-1.5 cursor-pointer rounded-lg text-xs font-medium transition-colors ${selectedSeverity ===
                                severity
                                ? "bg-[#3A29AA] text-white"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                        >
                            {severity}

                            {severity !==
                                "All" && (
                                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-white/20 text-xs">
                                        {severityCounts[
                                            severity
                                        ] || 0}
                                    </span>
                                )}
                        </button>
                    ))}
                </div>
            </div>
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">

                    {isLoading ? (
                        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                            <div className="flex justify-center mb-3">
                                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                            </div>

                            <p className="text-sm">
                                Loading notifications...
                            </p>
                        </div>
                    ) : filteredNotifications.length ===
                        0 ? (
                        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                            <p className="text-sm">
                                No notifications found
                            </p>
                        </div>
                    ) : (

                        filteredNotifications.map(
                            (notification) => {
                                const severity =
                                    notification.severity ||
                                    "INFO";

                                const SeverityIcon =
                                    severityIcons[
                                    severity as keyof typeof severityIcons
                                    ] || Info;

                                const severityColor =
                                    severityColors[
                                    severity as keyof typeof severityColors
                                    ] ||
                                    severityColors.INFO;

                                return (
                                    <div
                                        key={
                                            notification._id
                                        }
                                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`flex-shrink-0 w-20 px-2 py-1 rounded-md border text-[10px] font-bold text-center ${severityColor}`}
                                            >
                                                {
                                                    severity
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {
                                                            notification.message
                                                        }
                                                    </p>

                                                    <span className="text-xs text-slate-400 whitespace-nowrap">
                                                        {
                                                            notification.timestamp
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500 dark:text-slate-400">

                                                    {notification.fullName && (
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                                            {
                                                                notification.fullName
                                                            }
                                                        </span>
                                                    )}

                                                    {notification.email && (
                                                        <span>
                                                            {
                                                                notification.email
                                                            }
                                                        </span>
                                                    )}

                                                    {notification.phone && (
                                                        <span>
                                                            {
                                                                notification.phone
                                                            }
                                                        </span>
                                                    )}

                                                    {notification.category && (
                                                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">
                                                            {
                                                                notification.category
                                                            }
                                                        </span>
                                                    )}

                                                    <span
                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${notification.isRead
                                                            ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                                            }`}
                                                    >
                                                        {notification.isRead
                                                            ? "Read"
                                                            : "Unread"}
                                                    </span>
                                                </div>
                                                {notification.specialRequest && (
                                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="font-medium">
                                                            Request:
                                                        </span>{" "}
                                                        {
                                                            notification.specialRequest
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <SeverityIcon
                                                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${severity ===
                                                    "INFO"
                                                    ? "text-blue-500"
                                                    : severity ===
                                                        "WARNING"
                                                        ? "text-amber-500"
                                                        : severity ===
                                                            "CRITICAL"
                                                            ? "text-red-500"
                                                            : "text-emerald-500"
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                        )
                    )}
                </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                    Showing{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                        {startRecord}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                        {endRecord}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                        {totalRecords}
                    </span>{" "}
                    entries
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />

                        INFO (
                        {severityCounts.INFO ||
                            0}
                        )
                    </span>

                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />

                        WARNING (
                        {severityCounts.WARNING ||
                            0}
                        )
                    </span>

                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" />

                        CRITICAL (
                        {severityCounts.CRITICAL ||
                            0}
                        )
                    </span>
                </div>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        disabled={
                            currentPage === 1 ||
                            isLoading
                        }
                        onClick={
                            handlePrevious
                        }
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    {Array.from(
                        {
                            length: totalPages,
                        },
                        (_, index) =>
                            index + 1
                    ).map((page) => (
                        <button
                            key={page}
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                                handlePageChange(
                                    page
                                )
                            }
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage ===
                                page
                                ? "bg-[#3A29AA] text-white"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        type="button"
                        disabled={
                            currentPage ===
                            totalPages ||
                            isLoading
                        }
                        onClick={handleNext}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}