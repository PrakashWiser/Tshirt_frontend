import {
  useState,
  useMemo,
  useCallback,
  useRef,
  type ChangeEvent,
  type RefObject,
} from "react";
import type { SortState, ViewMode } from "./TableTypes";

interface Options<T extends object> {
  data: T[];
  searchKeys?: (keyof T)[];
  defaultView?: ViewMode;
  defaultPageSize?: number;
  paginationMode?: "server" | "client";
}

export interface DataTableState<T> {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  query: string;
  inputRef: RefObject<HTMLInputElement>;
  handleQueryChange: (e: ChangeEvent<HTMLInputElement>) => void;
  clearQuery: () => void;
  sort: SortState;
  handleSort: (key: string) => void;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;
  totalCount: number;
  totalPages: number;
  filteredCount: number;
  pagedData: T[];
}

export function useDataTable<T extends object>({
  data,
  searchKeys = [],
  defaultView = "table",
  defaultPageSize = 10,
  paginationMode = "client",
}: Options<T>): DataTableState<T> {
  const [view, setView] = useState<ViewMode>(defaultView);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ key: null, direction: null });
  const [page, setPageRaw] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(defaultPageSize);
  const inputRef = useRef<HTMLInputElement>(null!);

  const handleQueryChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPageRaw(1);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery("");
    setPageRaw(1);
    inputRef.current?.focus();
  }, []);

  const handleSort = useCallback((key: string) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: null };
    });
    setPageRaw(1);
  }, []);

  const setPage = useCallback((p: number) => setPageRaw(p), []);
  const setPageSize = useCallback((s: number) => {
    setPageSizeRaw(s);
    setPageRaw(1);
  }, []);

  const filteredData = useMemo<T[]>(() => {
    if (paginationMode === "server") return data;
    const q = query.trim().toLowerCase();
    if (!q || searchKeys.length === 0) return data;
    return data.filter((row) =>
      searchKeys.some((k) => {
        const v = row[k];
        return v != null && String(v).toLowerCase().includes(q);
      }),
    );
  }, [data, query, searchKeys, paginationMode]);

  const sortedData = useMemo<T[]>(() => {
    if (paginationMode === "server") return filteredData;
    if (!sort.key || !sort.direction) return filteredData;
    const { key, direction } = sort;
    return [...filteredData].sort((a, b) => {
      const av = (a as Record<string, unknown>)[key];
      const bv = (b as Record<string, unknown>)[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, {
              numeric: true,
              sensitivity: "base",
            });
      return direction === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sort, paginationMode]);

  const pagedData = useMemo<T[]>(() => {
    if (paginationMode === "server") return sortedData;
    const totalCount = sortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize, paginationMode]);

  const totalCount = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
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
    filteredCount: filteredData.length,
    pagedData,
  };
}
