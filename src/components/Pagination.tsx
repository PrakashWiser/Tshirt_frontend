import { memo, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    pageSizeOptions: number[];
    onPageChange: (p: number) => void;
    onPageSizeChange: (s: number) => void;
}

const SIBLING_COUNT = 1;
const DOTS = "…";

function buildPageRange(current: number, total: number): (number | string)[] {
    const range = (lo: number, hi: number) =>
        Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

    if (total <= 7) return range(1, total);

    const left = Math.max(current - SIBLING_COUNT, 1);
    const right = Math.min(current + SIBLING_COUNT, total);
    const showLeft = left > 2;
    const showRight = right < total - 1;

    if (!showLeft && showRight)
        return [...range(1, right + 1), DOTS, total];
    if (showLeft && !showRight)
        return [1, DOTS, ...range(left - 1, total)];
    return [1, DOTS, ...range(left, right), DOTS, total];
}

export const Pagination = memo(function Pagination({
    page,
    totalPages,
    totalCount,
    pageSize,
    pageSizeOptions,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    const pages = useMemo(() => buildPageRange(page, totalPages), [page, totalPages]);
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalCount);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Count + page size */}
            <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>
                    {totalCount === 0
                        ? "No results"
                        : `${start}–${end} of ${totalCount}`}
                </span>
                <div className="flex items-center gap-1.5">
                    <span>Rows</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="h-7 px-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/25 cursor-pointer"
                        aria-label="Rows per page"
                    >
                        {pageSizeOptions.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Page buttons */}
            <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
                <NavBtn
                    onClick={() => onPageChange(1)}
                    disabled={page === 1}
                    aria-label="First page"
                >
                    <ChevronsLeft size={13} />
                </NavBtn>
                <NavBtn
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={13} />
                </NavBtn>

                {pages.map((p, i) =>
                    p === DOTS ? (
                        <span
                            key={`dots-${i}`}
                            className="w-7 h-7 flex items-center justify-center text-xs text-slate-400 select-none"
                        >
                            {DOTS}
                        </span>
                    ) : (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPageChange(p as number)}
                            aria-label={`Page ${p}`}
                            aria-current={page === p ? "page" : undefined}
                            className={[
                                "w-7 h-7 rounded-lg text-xs font-medium transition-colors duration-150",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                                page === p
                                    ? "bg-[#0f172a] text-white"
                                    : "text-slate-600 hover:bg-slate-100",
                            ].join(" ")}
                        >
                            {p}
                        </button>
                    )
                )}

                <NavBtn
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Next page"
                >
                    <ChevronRight size={13} />
                </NavBtn>
                <NavBtn
                    onClick={() => onPageChange(totalPages)}
                    disabled={page === totalPages}
                    aria-label="Last page"
                >
                    <ChevronsRight size={13} />
                </NavBtn>
            </div>
        </div>
    );
});

function NavBtn({
    children,
    disabled,
    onClick,
    "aria-label": label,
}: {
    children: React.ReactNode;
    disabled: boolean;
    onClick: () => void;
    "aria-label": string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={[
                "w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                disabled
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
            ].join(" ")}
        >
            {children}
        </button>
    );
}