import type { ReactNode, CSSProperties } from "react";

export type SortDirection = "asc" | "desc" | null;
export type ViewMode = "table" | "grid";
export type ColumnAlign = "left" | "center" | "right";
export type PaginationMode = "server" | "client";

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: keyof T | ((row: T) => unknown);
  render?: (value: unknown, row: T) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  align?: ColumnAlign;
  hidden?: boolean;
}

export interface SortState {
  key: string | null;
  direction: SortDirection;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
}

export interface DataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: keyof T | ((row: T) => string | number);
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  onSearchChange?: (search: string) => void;
  defaultView?: ViewMode;
  renderGridCard?: (row: T, index: number) => ReactNode;
  gridClassName?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyState?: ReactNode;
  actions?: ReactNode;
  stickyHeader?: boolean;
  className?: string;
  style?: CSSProperties;
  paginationMode?: PaginationMode;
  pagination?: PaginationProps;
  debounceDelay?: number;
}
