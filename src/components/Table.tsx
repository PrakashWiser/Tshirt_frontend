import { memo, useCallback, type ReactNode } from "react";
import {
    Search,
    LayoutGrid,
    List,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    X,
    Inbox,
    Loader2,
} from "lucide-react";
import { useDataTable } from "./useDataTable";
import { Pagination } from "./Pagination";
import type { ColumnDef, DataTableProps, SortState } from "./TableTypes";

const TableSkeleton = memo(() => (
    <div className="animate-pulse p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-slate-100" />
        ))}
    </div>
));
TableSkeleton.displayName = "TableSkeleton";

const DefaultEmptyState = memo(() => (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
        <Inbox size={36} strokeWidth={1.5} className="text-slate-300" />
        <p className="text-sm font-medium">No results found</p>
    </div>
));
DefaultEmptyState.displayName = "DefaultEmptyState";

const SortIcon = memo(({ columnKey, sort }: { columnKey: string; sort: SortState }) => {
    if (sort.key !== columnKey)
        return <ChevronsUpDown size={12} className="ml-1 text-slate-300 shrink-0" />;
    if (sort.direction === "asc")
        return <ChevronUp size={12} className="ml-1 text-blue-500 shrink-0" />;
    return <ChevronDown size={12} className="ml-1 text-blue-500 shrink-0" />;
});
SortIcon.displayName = "SortIcon";

const ViewToggleBtn = memo(
    ({
        active,
        onClick,
        label,
        icon,
        text,
    }: {
        active: boolean;
        onClick: () => void;
        label: string;
        icon: ReactNode;
        text: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            aria-pressed={active}
            className={[
                "flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium select-none",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                active
                    ? "bg-[#3A29AA] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
            ].join(" ")}
        >
            {icon}
            <span className="hidden sm:inline">{text}</span>
        </button>
    )
);
ViewToggleBtn.displayName = "ViewToggleBtn";

function resolveValue<T>(row: T, col: ColumnDef<T>): unknown {
    return typeof col.accessor === "function"
        ? col.accessor(row)
        : row[col.accessor as keyof T];
}

const ALIGN: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
};

function THead<T>({
    columns,
    sort,
    onSort,
    sticky,
}: {
    columns: ColumnDef<T>[];
    sort: SortState;
    onSort: (k: string) => void;
    sticky?: boolean;
}) {
    return (
        <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
                {columns
                    .filter((c) => !c.hidden)
                    .map((col) => (
                        <th
                            key={col.key}
                            scope="col"
                            onClick={col.sortable ? () => onSort(col.key) : undefined}
                            style={{ width: col.width, minWidth: col.minWidth }}
                            className={[
                                "px-4 py-3 text-xs font-semibold tracking-wider text-slate-400 whitespace-nowrap",
                                ALIGN[col.align ?? "left"],
                                sticky
                                    ? "sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm"
                                    : "",
                                col.sortable
                                    ? "cursor-pointer select-none hover:text-slate-700 transition-colors"
                                    : "",
                            ].join(" ")}
                        >
                            <span className="inline-flex items-center">
                                {col.header}
                                {col.sortable && (
                                    <SortIcon columnKey={col.key} sort={sort} />
                                )}
                            </span>
                        </th>
                    ))}
            </tr>
        </thead>
    );
}

function TBody<T extends object>({
    data,
    columns,
    rowKey,
    onRowClick,
}: {
    data: T[];
    columns: ColumnDef<T>[];
    rowKey: DataTableProps<T>["rowKey"];
    onRowClick?: (row: T) => void;
}) {
    const getKey = useCallback(
        (row: T) =>
            typeof rowKey === "function"
                ? String(rowKey(row))
                : String(row[rowKey as keyof T]),
        [rowKey]
    );

    const visibleCols = columns.filter((c) => !c.hidden);

    return (
        <tbody className="divide-y divide-slate-50">
            {data?.map((row) => (
                <tr
                    key={getKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={[
                        "transition-colors duration-100 group",
                        onRowClick
                            ? "cursor-pointer hover:bg-blue-50/40"
                            : "hover:bg-slate-50/60",
                    ].join(" ")}
                >
                    {visibleCols.map((col) => {
                        const raw = resolveValue(row, col);
                        return (
                            <td
                                key={col.key}
                                className={[
                                    "px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap",
                                    ALIGN[col.align ?? "left"],
                                ].join(" ")}
                            >
                                {col.render ? col.render(raw, row) : (raw == null ? "—" : String(raw))}
                            </td>
                        );
                    })}
                </tr>
            ))}
        </tbody>
    );
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function DataTable<T extends object>({
    data,
    columns,
    rowKey,
    searchKeys,
    searchPlaceholder = "Search...",
    defaultView = "table",
    renderGridCard,
    gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 4xl:grid-cols-4 gap-4",
    pageSize: initialPageSize = 10,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    onRowClick,
    loading = false,
    emptyState,
    actions,
    stickyHeader = false,
    className = "",
    style,
    paginationMode = "client",
    pagination: externalPagination,
}: DataTableProps<T>) {
    const {
        view,
        setView,
        query,
        inputRef,
        handleQueryChange,
        clearQuery,
        sort,
        handleSort,
        page,
        pageSize,
        setPage,
        setPageSize,
        totalCount,
        totalPages,
        pagedData,
    } = useDataTable({
        data,
        searchKeys,
        defaultView,
        defaultPageSize: initialPageSize,
        paginationMode,
    });

    const isEmpty = !loading && pagedData.length === 0;

    const currentPage = externalPagination?.currentPage || page;
    const totalPagesCount = externalPagination?.totalPages || totalPages;
    const totalItems = externalPagination?.total || totalCount;
    const currentPageSize = externalPagination?.limit || pageSize;

    const handlePageChange = useCallback((newPage: number) => {
        if (externalPagination?.onPageChange) {
            externalPagination.onPageChange(newPage);
        } else {
            setPage(newPage);
        }
    }, [externalPagination, setPage]);

    const handlePageSizeChange = useCallback((newSize: number) => {
        if (externalPagination?.onLimitChange) {
            externalPagination.onLimitChange(newSize);
        } else {
            setPageSize(newSize);
        }
    }, [externalPagination, setPageSize]);

    return (
        <div className={["flex flex-col gap-4", className].join(" ")} style={style}>
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search
                        size={14}
                        aria-hidden="true"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={handleQueryChange}
                        placeholder={searchPlaceholder}
                        aria-label={searchPlaceholder}
                        className={[
                            "w-full h-9 pl-9 pr-8 rounded-xl border border-slate-200",
                            "bg-white text-sm text-slate-800 placeholder:text-slate-400",
                            "outline-none transition-shadow duration-150",
                            "focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400",
                        ].join(" ")}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={clearQuery}
                            aria-label="Clear search"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
                {actions}
                <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-200 bg-slate-50 shrink-0">
                    <ViewToggleBtn
                        active={view === "grid"}
                        onClick={() => setView("grid")}
                        label="Grid view"
                        icon={<LayoutGrid size={14} />}
                        text="Grid"
                    />
                    <ViewToggleBtn
                        active={view === "table"}
                        onClick={() => setView("table")}
                        label="List view"
                        icon={<List size={14} />}
                        text="List"
                    />
                </div>
            </div>
            {view === "table" ? (
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    {loading ? (
                        <TableSkeleton />
                    ) : isEmpty ? (
                        emptyState ?? <DefaultEmptyState />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <THead
                                        columns={columns}
                                        sort={sort}
                                        onSort={handleSort}
                                        sticky={stickyHeader}
                                    />
                                    <TBody
                                        data={pagedData}
                                        columns={columns}
                                        rowKey={rowKey}
                                        onRowClick={onRowClick}
                                    />
                                </table>
                            </div>
                            <div className="px-4 py-3">
                                <Pagination
                                    page={currentPage}
                                    totalPages={totalPagesCount}
                                    totalCount={totalItems}
                                    pageSize={currentPageSize}
                                    pageSizeOptions={pageSizeOptions}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                />
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <>
                    {loading ? (
                        <div className="flex justify-center py-16 text-slate-400">
                            <Loader2 size={24} className="animate-spin" />
                        </div>
                    ) : isEmpty ? (
                        <div className="rounded-xl border border-slate-200 bg-white">
                            {emptyState ?? <DefaultEmptyState />}
                        </div>
                    ) : (
                        <>
                            <div className={gridClassName}>
                                {pagedData?.map((row: any, i: number) =>
                                    renderGridCard ? (
                                        renderGridCard(row, i)
                                    ) : (
                                        <div
                                            key={i}
                                            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                                        >
                                            {columns
                                                .filter((c) => !c.hidden)
                                                .map((col) => {
                                                    const value =
                                                        typeof col.accessor === "function"
                                                            ? col.accessor(row)
                                                            : row[col.accessor];

                                                    return (
                                                        <div
                                                            key={col.key}
                                                            className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
                                                        >
                                                            <span className="text-xs text-slate-500">
                                                                {col.header}
                                                            </span>
                                                            <span className="text-sm font-medium text-slate-800">
                                                                {col.render
                                                                    ? col.render(value, row)
                                                                    : String(value ?? "-")}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )
                                )}
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
                                <Pagination
                                    page={currentPage}
                                    totalPages={totalPagesCount}
                                    totalCount={totalItems}
                                    pageSize={currentPageSize}
                                    pageSizeOptions={pageSizeOptions}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                />
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}