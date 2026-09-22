import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export const Pagination = memo(({
    page,
    totalPages,
    totalCount,
    pageSize,
    pageSizeOptions = [10, 20, 50, 100],
    onPageChange,
    onPageSizeChange,
}: PaginationProps) => {
    const startIndex = (page - 1) * pageSize + 1;
    const endIndex = Math.min(page * pageSize, totalCount);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (page <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push(-1);
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1);
                pages.push(-1);
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push(-1);
                for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                pages.push(-1);
                pages.push(totalPages);
            }
        }
        return pages;
    };

    if (totalCount === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>
                    Showing {startIndex}–{endIndex} of {totalCount}
                </span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="px-2 py-1 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                    {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>
                            {size} / page
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((p, idx) =>
                    p === -1 ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page
                                    ? "bg-[#3A29AA] text-white"
                                    : "hover:bg-slate-100 text-slate-600"
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
});

Pagination.displayName = "Pagination";