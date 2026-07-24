import DashboardLayout from "@/core/layouts/DashboardLayout";
import type { NavItem } from "@/core/types";
import { LuTarget } from "react-icons/lu";
import {
  // MdHome,
  MdSwapHoriz,
  MdAttachMoney,
  MdAnalytics,
  // MdTrendingUp,
  // MdAccessTime,
  // MdPeople,
} from "react-icons/md";

export const LOGISTICS_NAV_ITEMS: NavItem[] = [
  // {
  //   label: "Inicio",
  //   to: "/logistics/home",
  //   icon: MdHome,
  // },
  { label: "Overview", to: "/logistics/analytics/overview", icon: MdAnalytics },
  // {
  //   label: "Ventas y Rendimiento",
  //   to: "/logistics/analytics/sales",
  //   icon: MdTrendingUp,
  // },
  {
    label: "Economía y Recompensas",
    to: "/logistics/analytics/economy",
    icon: MdAttachMoney,
  },
  {
    label: "Adopción y Gamificación",
    to: "/logistics/analytics/gamification",
    icon: LuTarget,
  },
  // {
  //   label: "Uso de Vendedores",
  //   to: "/logistics/analytics/seller-adoption",
  //   icon: MdPeople,
  // },

  {
    label: "Gestión de Canjes",
    to: "/logistics/reward-claims",
    icon: MdSwapHoriz,
  },
  // { label: "Uso Diario", to: "/logistics/analytics/usage", icon: MdAccessTime },
];

export default function LogisticsLayout() {
  return <DashboardLayout navItems={LOGISTICS_NAV_ITEMS} />;
}
