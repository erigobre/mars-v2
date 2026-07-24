import type { ElementType, Key, ReactNode } from "react";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
}

export type PaginationLinks = {
  first: string;
  last: string;
  next: string | null;
  prev: string | null;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
};

export type PaginatedData<T> = {
  items: T;
  links: PaginationLinks;
  meta: PaginationMeta;
};

export type NavItem = {
  label: string;
  href?: string;
  to: string;
  icon: ElementType;
  children?: NavItem[];
};

export type DataTableColumn<TData> = {
  label: string;
  render: (item: TData) => ReactNode;
  className?: string;
  alignRight?: boolean;
  primary?: boolean;
  mobileHidden?: boolean;
};

export type DataTableProps<TData extends { id: Key }> = {
  columns: DataTableColumn<TData>[];
  data: TData[];

  title?: string;
  titleIcon?: ReactNode;
  viewAllLabel?: string;
  onViewAll?: () => void;

  isLoading?: boolean;
  isPlaceholderData?: boolean;
  emptyMessage?: string;

  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  
  renderExpandedRow?: (item: TData) => ReactNode; 
};

export type FilterState = {
  categories: string[];
  minPoints: string;
  maxPoints: string;
  onlyAffordable: boolean;
};

export type StockStatus = "hot" | "low" | "available" | "out";

