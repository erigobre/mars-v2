export type DailyUsageRoleFilter =
  | "seller"
  | "distributor"
  | "admin"
  | "logistics"
  | "";

export interface DailyUsageFilters {
  date?: string;
  tz?: string;
  role?: DailyUsageRoleFilter;
  distributorId?: number | string;
}

export const ROLE_OPTIONS: { value: DailyUsageRoleFilter; label: string }[] = [
  { value: "",            label: "Todos los roles"    },
  { value: "seller",      label: "Vendedores"         },
  { value: "distributor", label: "Distribuidores"     },
  { value: "admin",       label: "Administradores"    },
  { value: "logistics",   label: "Logística"          },
];