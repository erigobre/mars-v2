import DashboardLayout from "@/core/layouts/DashboardLayout";
import type { NavItem } from "@/core/types";
import { LuTarget } from "react-icons/lu";
import {
  MdHome,
  MdBusiness,
  MdPeople,
  MdInventory,
  MdCampaign,
  MdCardGiftcard,
  MdSwapHoriz,
  MdUploadFile,
  MdAttachMoney,
  MdAnalytics,
  MdStorefront,
  MdTrendingUp,
  MdViewModule,
  MdLocalShipping,
  MdLayers,
  MdAccessTime,
} from "react-icons/md";

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { 
    label: "Inicio", 
    to: "/admin/home", 
    icon: MdHome 
  },
  {
    label: "Analíticas",
    to: "/admin/analytics",
    icon: MdAnalytics,
    children: [
      { label: "Overview", to: "/admin/analytics/overview", icon: MdAnalytics },
      { label: "Ventas y Rendimiento", to: "/admin/analytics/sales", icon: MdTrendingUp },
      { label: "Economía y Recompensas", to: "/admin/analytics/economy", icon: MdAttachMoney },
      { label: "Adopción y Gamificación", to: "/admin/analytics/gamification", icon: LuTarget },
      { label: "Uso Diario", to: "/admin/analytics/usage", icon: MdAccessTime },
      { label: "Uso de Vendedores", to: "/admin/analytics/seller-adoption", icon: MdPeople },
      { label: "Auditoría / Logs", to: "/admin/analytics/logs", icon: MdInventory },
    ],
  },
  {
    label: "Ventas",
    to: "/admin/sales",
    icon: MdAttachMoney,
    children: [
      { label: "Historial de Ventas", to: "/admin/sales", icon: MdAttachMoney },
      { label: "Cargar Ventas", to: "/admin/sales/upload", icon: MdUploadFile },
    ],
  },
  {
    label: "Operación",
    to: "/admin/campaigns",
    icon: MdCampaign,
    children: [
      { label: "Campañas", to: "/admin/campaigns", icon: MdCampaign },
      { label: "Metas y Objetivos", to: "/admin/goals", icon: LuTarget },
    ],
  },
  {
    label: "Catálogo",
    to: "/admin/products",
    icon: MdStorefront,
    children: [
      { label: "Productos", to: "/admin/products", icon: MdInventory },
      { label: "Displays", to: "/admin/displays", icon: MdViewModule },
      { label: "Premios", to: "/admin/rewards", icon: MdCardGiftcard },
      { label: "Rangos", to: "/admin/sellers/tiers", icon: MdLayers  },
      { label: "Gestión de Canjes", to: "/admin/reward-claims", icon: MdSwapHoriz },
    ],
  },
  {
    label: "Gestión",
    to: "/admin/distributors",
    icon: MdPeople,
    children: [
      { label: "Distribuidores", to: "/admin/distributors", icon: MdBusiness },
      { label: "Vendedores", to: "/admin/sellers", icon: MdPeople },
      { label: "Logística", to: "/admin/logistics", icon: MdLocalShipping }
    ],
  }
];

export default function AdminLayout() {
  return <DashboardLayout navItems={ADMIN_NAV_ITEMS} />;
}
